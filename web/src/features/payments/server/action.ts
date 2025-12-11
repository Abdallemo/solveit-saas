"use server";

import db from "@/drizzle/db";
import {
  BlockedTasksTable,
  PaymentTable,
  RefundTable,
  TaskTable,
} from "@/drizzle/schemas";
import { env } from "@/env/server";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import { Notifier } from "@/features/notifications/server/notifier";
import {
  notifyRefundApproval,
  notifyRefundComplete,
  notifyTaskReopen,
} from "@/features/notifications/server/utils";
import {
  getNewReleaseDate,
  SOLVER_MIN_WITHDRAW_AMOUNT,
} from "@/features/payments/server/constants";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import {
  getModeratorDisputes,
  getWalletInfo,
} from "@/features/tasks/server/data";
import {
  CreateUserDetailField,
  getUserById,
  UpdateUserField,
} from "@/features/users/server/actions";
import {
  OnboardingFormData,
  publicUserColumns,
  User,
} from "@/features/users/server/user-types";
import { withRevalidateTag } from "@/lib/cache";
import {
  DisputeAssignmentError,
  DisputeNotFoundError,
  DisputeRefundedError,
  DisputeUnauthorizedError,
  UnauthorizedError,
} from "@/lib/Errors";
import { logger } from "@/lib/logging/winston";
import { stripe } from "@/lib/stripe";
import { to } from "@/lib/utils/async";
import { getCurrentServerTime, toYMD } from "@/lib/utils/utils";
import { isBefore, subYears } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getRefundDetails } from "./data";
import { refundType, StripeConnectConfig } from "./types";
export type cardsType = Awaited<
  ReturnType<typeof getAllCustomerPaymentMethods>
>;
export type paymentType = Awaited<ReturnType<typeof getAllPayments>>[number];
export async function getAllCustomerPaymentMethods(userId: string) {
  if (!userId) return [];
  const user = await getUserById(userId);
  if (!user || !user.id) return [];
  if (!user?.stripeCustomerId) {
    return [];
  }
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });
    const cards = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year,
    }));

    return cards;
  } catch (error) {
    console.error("Failed to retrieve payment methods:", error);
    return [];
  }
}

export async function ManageUserCreditCardPortal() {
  const { id } = (await getServerUserSession())!;
  const referer = await getServerReturnUrl();
  if (id == null) return;
  const user = await getUserById(id);

  if (user?.stripeCustomerId == null) return;
  const configuration = await stripe.billingPortal.configurations.create({
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["address"],
      },
      invoice_history: {
        enabled: false,
      },
      payment_method_update: {
        enabled: true,
      },
    },
  });
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user?.stripeCustomerId,
    return_url: referer,
    configuration: configuration.id,
  });
  return portalSession.url;
}

export async function getPaymentByPaymentIntentId(
  stripePaymentIntentId: string,
) {
  return await db.query.PaymentTable.findFirst({
    where: (tb, fn) => fn.eq(tb.stripePaymentIntentId, stripePaymentIntentId),
  });
}
export async function getAllPayments() {
  await isAuthorized(["ADMIN"]);
  const results = await db.query.PaymentTable.findMany({
    with: {
      payer: {
        columns: publicUserColumns,
      },
    },
  });
  return results.map((p) => {
    const { payer, ...payment } = p;
    return {
      ...payer,
      ...payment,
    };
  });
}

export async function handlerStripeConnect() {
  const { session } = await isAuthorized(["POSTER", "SOLVER"], {
    useCache: false,
  });
  const { user } = session;
  if (!user || !user.id) return;

  const urlprix = `${
    env.NEXTAUTH_URL
  }/dashboard/${user.role?.toLocaleLowerCase()}/billings?user=${user.id}`;
  console.log(
    `trying to account link for user with account id : ${user.stripeAccountId} and url :${urlprix}`,
  );
  const stripeSession = await stripe.accountLinks.create({
    account: user.stripeAccountId!,
    type: "account_onboarding",
    collect: "currently_due",
    return_url: urlprix,
    refresh_url: urlprix,
  });

  return redirect(stripeSession.url);
}
export async function CreateUserStripeConnectAccount(
  values: OnboardingFormData,
  user: User,
) {
  let [account, err] = await to(
    stripe.accounts.create({
      ...StripeConnectConfig(values, user),
    }),
  );
  if (err) {
    logger.error(
      `Stripe Account Connec Failed cause : ${(err as Error).message}`,
      {
        message: (err as Error).message,
        cause: (err as Error).cause,
      },
    );
    return new Error("Stripe Account Connec Failed.");
  }
  err = await UpdateUserField(
    {
      id: user.id!,
    },
    { stripeAccountId: account?.id },
  );
  if (err) {
    logger.error(
      `Failed to Update User Stripe field. cause :${(err as Error).message}`,
      {
        message: (err as Error).message,
        cause: (err as Error).cause,
      },
    );
    return new Error("Failed to Update User field");
  }
  return null;
}
export async function handleUserOnboarding(
  values: OnboardingFormData,
): Promise<{ error: string | null }> {
  try {
    if (!values) return { error: "all fields are required" };
    const {
      session: { user },
    } = await isAuthorized(["POSTER", "SOLVER"]);

    if (!user) return { error: new UnauthorizedError().message };
    if (user.onboardingCompleted) return { error: "Already record exist" };
    const dob =
      values.dob instanceof Date ? values.dob : new Date(values.dob as any);
    const minDate = new Date("1900-01-01");
    const maxDate = subYears(new Date(), 13);

    if (dob > maxDate || dob < minDate) {
      return {
        error:
          "You must be at least 13 years of age to use the platform and receive funds",
      };
    }
    let err = await CreateUserStripeConnectAccount({ ...values, dob }, user);
    if (err) return { error: "Something went wrong" };

    err = await CreateUserDetailField({
      userId: user.id,
      address: values.address,
      business: values.business_profile,
      dateOfBirth: toYMD(dob),
      firstName: values.first_name,
      lastName: values.last_name,
    });
    if (err) return { error: "Something went wrong" };

    err = await UpdateUserField({ id: user.id }, { onboardingCompleted: true });
    if (err) return { error: "Something went wrong" };

    revalidateTag(`user-${user.id}`);
    return {
      error: null,
    };
  } catch (error) {
    logger.error("unable to save user details", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return { error: "Something went wrong" };
  }
}
export async function refundFunds(paymentId: string) {
  try {
    const payment = await db.query.PaymentTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, paymentId),
      columns: { stripeChargeId: true, amount: true, id: true },
    });
    if (!payment?.stripeChargeId) {
      return {
        error: "Payment charge not found.",
        success: null,
      };
    }

    const st = await stripe.refunds.create({
      charge: payment.stripeChargeId,
    });

    if (st.status === "succeeded") {
      await db.transaction(async (dx) => {
        await dx
          .update(RefundTable)
          .set({
            refundedAt: new Date(),
            refundStatus: "REFUNDED",
          })
          .where(eq(RefundTable.paymentId, paymentId));

        await dx
          .update(PaymentTable)
          .set({ status: "REFUNDED" })
          .where(eq(PaymentTable.id, paymentId));
        await dx.delete(TaskTable).where(eq(TaskTable.paymentId, paymentId));
      });
    } else {
      return {
        error: "Unable to process the refund.",
        success: null,
      };
    }
    return {
      error: null,
      success: "Refunded Successfully",
    };
  } catch (error) {
    console.error(error);
    logger.error("Failed to execute Stripe refund.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return {
      error: "Unable to process the refund.",
      success: null,
    };
  }
}
export async function completeRefund(refundId: string) {
  try {
    await isAuthorized(["POSTER"]);
    const refund = await getRefundDetails(refundId);

    if (!refund || refund.refundStatus !== "PENDING_USER_ACTION") {
      return {
        error: "Invalid request to complete refund.",
        success: null,
      };
    }
    const { error } = await refundFunds(refund.paymentId);
    if (error) {
      return {
        error: error,
        success: null,
      };
    }
    notifyRefundComplete(refund);
    return {
      error: null,
      success: "successfully refunded to your payment method",
    };
  } catch (error) {
    logger.error("Failed to complete refund.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });

    return {
      error:
        "Unable to complete the refund. Please try again or contact support.",
      success: null,
    };
  }
}
export async function reopenTask(refundId: string) {
  try {
    const { user } = await isAuthorized(["POSTER"]);
    const refund = await getRefundDetails(refundId);

    if (
      !refund ||
      refund.refundStatus !== "PENDING_USER_ACTION" ||
      refund.taskRefund?.poster.id !== user.id
    ) {
      return {
        error: "Invalid request to re-open task.",
        success: null,
      };
    }

    await updateRefundAndResetTaskTx(refund);

    withRevalidateTag("dispute-data-cache");

    notifyTaskReopen(refund);

    return {
      error: null,
      success: "successfully re-open your task",
    };
  } catch (error) {
    logger.error("Failed to re-open task.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return {
      error:
        " Unable to re-open the task. Please try again or contact support.",
      success: null,
    };
  }
}
export async function approveRefund(refundId: string) {
  try {
    const { user } = await isAuthorized(["MODERATOR"]);
    const refund = await getRefundDetails(refundId);

    if (!refund) {
      return {
        error: new DisputeNotFoundError().data.message,
        success: null,
      };
    }
    const isResponsible = refund.moderatorId === user.id;
    if (!isResponsible) {
      return {
        error: new DisputeUnauthorizedError().message,
        success: null,
      };
    }

    if (refund.refundStatus === "REFUNDED") {
      return {
        error: new DisputeRefundedError().message,
        success: null,
      };
    }
    await updateRefundApprovePendingTx(refund);

    withRevalidateTag("dispute-data-cache");
    notifyRefundApproval(refund);

    return {
      error: null,
      success: "successfully approved the refund",
    };
  } catch (error) {
    logger.error("Failed to approve refund and set pending state.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });

    return {
      error:
        "Unable to approve the refund. Please try again or contact support.",
      success: null,
    };
  }
}
export async function rejectRefund(refundId: string) {
  try {
    const { user } = await isAuthorized(["MODERATOR"]);
    const refund = await db.query.RefundTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, refundId),
      with: {
        taskRefund: {
          with: {
            solver: {
              columns: {
                email: true,
                stripeAccountLinked: true,
                stripeAccountId: true,
              },
            },
            poster: {
              columns: {
                email: true,
              },
            },
          },
        },
      },
      // columns:{moderatorId:true,refundStatus:true}
    });

    if (!refund) {
      return {
        error: new DisputeNotFoundError().message,
        success: null,
      };
    }
    const isResponsible = refund.moderatorId === user.id;
    if (!isResponsible) {
      return {
        error: new DisputeUnauthorizedError().message,
        success: null,
      };
    }
    if (
      refund.refundStatus === "REFUNDED" ||
      refund.refundStatus === "PENDING_USER_ACTION"
    ) {
      return {
        error: new DisputeRefundedError().message,
        success: null,
      };
    }
    if (!refund.taskRefund?.solver?.stripeAccountId) {
      return {
        error: new UnauthorizedError().message,
        success: null,
      };
    }
    await db.transaction(async (dx) => {
      await dx
        .update(RefundTable)
        .set({
          refundStatus: "REJECTED",
          updatedAt: getCurrentServerTime(),
        })
        .where(eq(RefundTable.paymentId, refund.paymentId));

      await dx
        .update(PaymentTable)
        .set({
          status: "PENDING_USER_ACTION",
          releaseDate: getNewReleaseDate(),
        })
        .where(eq(PaymentTable.id, refund.paymentId));
      await dx
        .delete(BlockedTasksTable)
        .where(
          and(
            eq(BlockedTasksTable.taskId, refund.taskId!),
            eq(BlockedTasksTable.userId, refund.taskRefund?.solverId!),
          ),
        );
      await dx
        .update(TaskTable)
        .set({ updatedAt: new Date(), status: "COMPLETED" })
        .where(eq(TaskTable.solverId, refund.taskRefund?.solverId!));
    });

    Notifier()
      .system({
        subject: "Dispute Resolved",
        content: `Good news! The refund request for Task ID ${refund.taskRefund.id} has been rejected by the moderator.
        The payment for your completed work has been released to your account. Thank you for your contribution!`,
        receiverId: refund.taskRefund.solverId!,
      })
      .email({
        subject: "Dispute Resolved",
        content: `Good news! The refund request for Task ID ${refund.taskRefund.id} has been rejected by the moderator. The payment for your completed work has been released to your e-wallet. Please remember to <h2>withdraw the funds</h2> to your bank account. Thank you for your contribution!`,
        receiverEmail: refund.taskRefund.solver.email!,
      });

    Notifier()
      .system({
        subject: "Dispute Resolution Finalized",
        content: `Bad news! Your refund request for Task ID ${refund.taskRefund.id} has been rejected by the moderator.
      The payment for the completed task has been released to the Solver's account. Thank you for your patience during this process!`,
        receiverId: refund.taskRefund.posterId!,
      })
      .email({
        subject: "Dispute Resolution Finalized",
        content: `Bad news! Your refund request for Task ID ${refund.taskRefund.id} has been rejected by the moderator. The payment for the completed task has been released to the Solver. Please remember to <h2>review the moderator's decision</h2> for full details. Thank you for using SolveIt!`,
        receiverEmail: refund.taskRefund.poster.email!,
      });
    return {
      error: null,
      success: "successfully rejected the refund",
    };
  } catch (error) {
    logger.error("Failed to reject refund.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });

    return {
      error:
        "Unable to reject the refund. Please try again or contact support.",
      success: null,
    };
  }
}
export async function requestWithdraw() {
  try {
    const { user } = await isAuthorized(["SOLVER"]);
    const { available, nextReleaseDate, paymentIds } = await getWalletInfo(
      user.id,
    );
    if (available < SOLVER_MIN_WITHDRAW_AMOUNT) {
      return {
        error: `you can withdraw minimum of RM ${SOLVER_MIN_WITHDRAW_AMOUNT}`,
        success: null,
      };
    }
    if (!user.stripeAccountId) {
      return {
        error: new UnauthorizedError().message,
        success: null,
      };
    }
    if (nextReleaseDate && isBefore(getCurrentServerTime(), nextReleaseDate)) {
      return {
        error: `the withdraw is locked your next withdraw is on ${nextReleaseDate?.toLocaleDateString()}`,
        success: null,
      };
    }
    if (!user.stripeAccountLinked) {
      return {
        error: "please visit your billing and connect your account",
        success: null,
      };
    }

    await stripe.transfers.create({
      amount: available * 100,
      currency: "myr",
      destination: user.stripeAccountId,
    });
    await db
      .update(PaymentTable)
      .set({ status: "RELEASED" })
      .where(inArray(PaymentTable.id, paymentIds));

    return {
      error: null,
      success: "withdrawal request submitted successfully",
    };
  } catch (error) {
    logger.error("Failed to transfer funds to solver.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return {
      error: "failed to tranfer the amount please try again",
      success: null,
    };
  }
}
export async function assignDisputeToModerator(disputeId: string) {
  const { user } = await isAuthorized(["MODERATOR"]);
  const dispute = await getModeratorDisputes(disputeId);
  if (!dispute) return;
  if (dispute.moderatorId) {
    throw new DisputeAssignmentError();
  }
  await db
    .update(RefundTable)
    .set({ moderatorId: user.id, refundStatus: "PROCESSING" })
    .where(eq(RefundTable.id, disputeId));
  withRevalidateTag("dispute-data-cache");

  return `/dashboard/moderator/disputes/${dispute.id}`;
}
export async function updateRefundAndResetTaskTx(refund: refundType) {
  return await db.transaction(async (dx) => {
    await dx
      .update(RefundTable)
      .set({
        refundStatus: "REJECTED",
        updatedAt: new Date(),
      })
      .where(eq(RefundTable.id, refund.id));

    await dx
      .update(TaskTable)
      .set({
        assignedAt: null,
        solverId: null,
        status: "OPEN",
        updatedAt: new Date(),
      })
      .where(eq(TaskTable.id, refund.taskRefund?.id!));
  });
}
export async function updateRefundApprovePendingTx(refund: refundType) {
  await db.transaction(async (dx) => {
    await dx
      .update(RefundTable)
      .set({
        refundStatus: "PENDING_USER_ACTION",
        updatedAt: getCurrentServerTime(),
        refundedAt: getCurrentServerTime(),
      })
      .where(eq(RefundTable.paymentId, refund.paymentId));

    await dx
      .update(PaymentTable)
      .set({ status: "PENDING_USER_ACTION" })
      .where(eq(PaymentTable.id, refund.paymentId));
  });
}
