"use server";

import db from "@/drizzle/db";
import {
  BlockedTasksTable,
  PaymentTable,
  RefundTable,
  TaskTable,
  UserDetails,
} from "@/drizzle/schemas";
import { env } from "@/env/server";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import { Notifier } from "@/features/notifications/server/notifier";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import { getModeratorDisputes } from "@/features/tasks/server/data";
import {
  getUserById,
  UpdateUserField,
  UserDbType,
} from "@/features/users/server/actions";
import {
  OnboardingFormData,
  publicUserColumns,
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
import { toYMD } from "@/lib/utils";
import { subYears } from "date-fns";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
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
  stripePaymentIntentId: string
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
export async function getStripeConnectAccount() {
  const { user } = await isAuthorized(["POSTER", "SOLVER"]);
  if (!user || !user.id) return;
}

export async function handlerStripeConnect() {
  const { user } = await isAuthorized(["POSTER", "SOLVER"]);
  if (!user || !user.id) return;
  const urlprix = `${
    env.NEXTAUTH_URL
  }/dashboard/${user.role?.toLocaleLowerCase()}/billings?user=${user.id}`;
  console.log(
    `trying to account link for user with account id : ${user.stripeAccountId} and url :${urlprix}`
  );
  const session = await stripe.accountLinks.create({
    account: user.stripeAccountId!,
    type: "account_onboarding",
    collect: "currently_due",
    return_url: urlprix,
    refresh_url: urlprix,
  });
  console.log(`redirecting to ${session.url}`);
  return redirect(session.url);
}
export async function CreateUserStripeConnectAccount(
  values: OnboardingFormData,
  user: UserDbType
) {
  const account = await stripe.accounts.create({
    type: "standard",
    email: user.email!,
    business_type: "individual",

    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    individual: {
      first_name: values.first_name,
      last_name: values.last_name,
      email: user.email!,
      dob: {
        day: values.dob?.getDate()!,
        month: values.dob?.getMonth()! + 1,
        year: values.dob?.getFullYear()!,
      },
      address: values.address,
      phone: "+15555550123",
      id_number: "000000000",
      verification: {
        document: {
          front: "file_identity_document_success",
        },
      },
    },
    business_profile: {
      mcc:
        values.business_profile.mcc === "5734"
          ? values.business_profile.mcc
          : "5734",
      product_description:
        "SolveIt is a student job board where students post and solve academic tasks.",
      url:
        process.env.NODE_ENV === "development"
          ? env.PRODUCTION_URL
          : env.NEXTAUTH_URL,
    },
  });

  await UpdateUserField({
    id: user.id!,
    data: { stripeAccountId: account.id },
  });
}
export async function handleUserOnboarding(values: OnboardingFormData) {
  try {
    if (!values) throw new Error("all fields are required");
    const { user } = await isAuthorized(["POSTER", "SOLVER"]);
    if (!user) throw new UnauthorizedError();
    if (user.userDetails.onboardingCompleted)
      throw new Error("Already record exist");
    const dob =
      values.dob instanceof Date ? values.dob : new Date(values.dob as any);
    const minDate = new Date("1900-01-01");
    const maxDate = subYears(new Date(), 13);

    if (dob > maxDate || dob < minDate) {
      throw new Error(
        "You must be at least 13 years of age to use the platform and receive funds"
      );
    }
    await CreateUserStripeConnectAccount({ ...values, dob }, user); //==> synchronous job
    await db
      .update(UserDetails)
      .set({
        userId: user.id,
        address: values.address,
        business: values.business_profile,
        dateOfBirth: toYMD(dob),
        firstName: values.first_name,
        lastName: values.last_name,
        onboardingCompleted: true,
      })
      .where(eq(UserDetails.userId, user.id));
    revalidateTag(`user-${user.id}`);
  } catch (error) {
    logger.error("unable to save user details", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("something went wrong");
  }
}
export async function refundFunds(paymentId: string) {
  try {
    const payment = await db.query.PaymentTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, paymentId),
      columns: { stripeChargeId: true, amount: true, id: true },
    });
    if (!payment?.stripeChargeId) {
      throw new Error("Payment or Stripe charge not found.");
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
      });
    } else {
      throw new Error("Stripe refund failed with status: " + st.status);
    }
  } catch (error) {
    console.error(error);
    logger.error("Failed to execute Stripe refund.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("Unable to process the refund.");
  }
}
export async function completeRefund(refundId: string) {
  console.warn("passed refundId ", refundId);
  try {
    const { user } = await isAuthorized(["POSTER"]);
    const refund = await db.query.RefundTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, refundId),
      with: {
        taskRefund: { with: { poster: { columns: publicUserColumns } } },
      },
    });

    if (!refund || refund.refundStatus !== "PENDING_POSTER_ACTION") {
      throw new Error("Invalid request to complete refund.");
    }
    await refundFunds(refund.paymentId);

    Notifier()
      .system({
        receiverId: refund.taskRefund.posterId,
        subject: "Refund Processed",
        content: `Your refund for the dispute with ID ${refund.id} has been successfully processed. 
      The amount of ${refund.taskRefund.price} will be returned to your original payment method.`,
      })
      .email({
        receiverEmail: refund.taskRefund.poster.email!,
        subject: "Refund Processed",
        content: `<h4>Your refund for the dispute with ID ${refund.id} has been successfully processed</h4>. 
      The amount of ${refund.taskRefund.price} will be returned to your original payment method.`,
      });
  } catch (error) {
    logger.error("Failed to complete refund.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error(
      "Unable to complete the refund. Please try again or contact support."
    );
  }
}
export async function reopenTask(refundId: string) {
  try {
    const { user } = await isAuthorized(["POSTER"]);
    const refund = await db.query.RefundTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, refundId),
      with: {
        taskRefund: {
          with: {
            poster: { columns: publicUserColumns },
            solver: { columns: publicUserColumns },
          },
        },
      },
    });

    if (
      !refund ||
      refund.refundStatus !== "PENDING_POSTER_ACTION" ||
      refund.taskRefund.poster.id !== user.id
    ) {
      throw new Error("Invalid request to re-open task.");
    }

    await db.transaction(async (dx) => {
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
        .where(eq(TaskTable.id, refund.taskRefund.id));
    });

    withRevalidateTag("dispute-data-cache");

    Notifier()
      .system({
        receiverId: refund.taskRefund.posterId!,
        content: `You have chosen to re-open task ID ${refund.taskRefund.id}. The task is now available for other solvers to apply.`,
        subject: "Task Re-opened",
      })
      .email({
        receiverEmail: refund.taskRefund.poster.email!,
        content: `You have chosen to re-open task ID ${refund.taskRefund.id}. The task is now available for other solvers to apply.`,
        subject: "Task Re-opened",
      });
  } catch (error) {
    logger.error("Failed to re-open task.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error(
      "Unable to re-open the task. Please try again or contact support."
    );
  }
}
export async function approveRefund(refundId: string) {
  try {
    const { user } = await isAuthorized(["MODERATOR"]);
    const refund = await db.query.RefundTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, refundId),
      with: {
        taskRefund: {
          with: {
            poster: { columns: publicUserColumns },
            solver: { columns: publicUserColumns },
          },
        },
      },
      // columns:{moderatorId:true,refundStatus:true}
    });

    if (!refund) {
      throw new DisputeNotFoundError();
    }
    const isResponsible = refund.moderatorId === user.id;
    if (!isResponsible) throw new DisputeUnauthorizedError();
    if (refund.refundStatus === "REFUNDED") throw new DisputeRefundedError();
    await db.transaction(async (dx) => {
      await dx
        .update(RefundTable)
        .set({
          refundStatus: "PENDING_POSTER_ACTION",
          updatedAt: new Date(),
        })
        .where(eq(RefundTable.paymentId, refund.paymentId));

      await dx
        .update(PaymentTable)
        .set({ status: "HOLD" })
        .where(eq(PaymentTable.id, refund.paymentId));
    });
    withRevalidateTag("dispute-data-cache");

    Notifier()
      .system({
        subject: "Refund Accepted",
        receiverId: refund.taskRefund.posterId,
        content: `Your refund for the dispute with ID ${refund.id} has been Accepted.Please Take action with in 7days or The amount of ${refund.taskRefund.price} will be returned to your original payment method.`,
      })
      .email({
        subject: "Refund Accepted",
        receiverEmail: refund.taskRefund.poster.email!,
        content: `<h3>Your refund for the dispute with ID ${refund.id} has been Accepted.</h3>
        Please Take action with in 7days or The amount of ${refund.taskRefund.price} will be returned to your original payment method.`,
      });

    Notifier()
      .system({
        subject: "Dispute Resolved",
        receiverId: refund.taskRefund.solverId!,
        content: `The dispute for task ID ${refund.taskRefund.id} has been resolved in the poster's favor.
          The held payment has been refunded to them and will not be disbursed to you.`,
      })
      .email({
        subject: "Dispute Resolved",
        receiverEmail: refund.taskRefund.solver?.email!,
        content: `The dispute for task ID ${refund.taskRefund.id} has been resolved in the poster's favor.
          The held payment has been refunded to them and will not be disbursed to you.`,
      });
  } catch (error) {
    logger.error("Failed to approve refund and set pending state.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error(
      "Unable to approve the refund. Please try again or contact support."
    );
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
                ...publicUserColumns,
                stripeAccountLinked: true,
                stripeAccountId: true,
              },
            },
          },
        },
      },
      // columns:{moderatorId:true,refundStatus:true}
    });

    if (!refund) {
      throw new DisputeNotFoundError();
    }
    const isResponsible = refund.moderatorId === user.id;
    if (!isResponsible) throw new DisputeUnauthorizedError();
    if (
      refund.refundStatus === "REFUNDED" ||
      refund.refundStatus === "PENDING_POSTER_ACTION"
    ) {
      throw new DisputeRefundedError();
    }
    if (!refund.taskRefund.solver?.stripeAccountId) {
      throw new UnauthorizedError();
    }
    if (!refund.taskRefund.solver?.stripeAccountLinked) {
      throw new Error("please visit your billing and connect your account");
    }
    const transfer = await stripe.transfers.create({
      amount: refund.taskRefund.price! * 100,
      currency: "myr",
      destination: refund.taskRefund.solver.stripeAccountId,
    });

    await db.transaction(async (dx) => {
      await dx
        .update(RefundTable)
        .set({
          refundStatus: "REJECTED",
          updatedAt: new Date(),
        })
        .where(eq(RefundTable.paymentId, refund.paymentId));
      //todo
      await dx
        .update(PaymentTable)
        .set({ status: "RELEASED", releaseDate: new Date() })
        .where(eq(PaymentTable.id, refund.paymentId));
      await dx
        .delete(BlockedTasksTable)
        .where(
          and(
            eq(BlockedTasksTable.taskId, refund.taskId),
            eq(BlockedTasksTable.userId, refund.taskRefund.solverId!)
          )
        );
      await dx
        .update(TaskTable)
        .set({ updatedAt: new Date(), status: "COMPLETED" })
        .where(eq(TaskTable.solverId, refund.taskRefund.solverId!));
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
        content: `Good news! The refund request for Task ID ${refund.taskRefund.id} has been rejected by the moderator.  
        The payment for your completed work has been released to your account. Thank you for your contribution!`,
        receiverEmail: refund.taskRefund.solver.email!,
      });
  } catch (error) {
    logger.error("Failed to reject refund.", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error(
      "Unable to reject the refund. Please try again or contact support."
    );
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
