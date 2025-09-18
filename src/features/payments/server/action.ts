"use server";

import db from "@/drizzle/db";
import { PaymentTable, RefundTable, UserDetails } from "@/drizzle/schemas";
import { env } from "@/env/server";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import {
  getUserById,
  UpdateUserField,
  UserDbType,
} from "@/features/users/server/actions";
import { OnboardingFormData } from "@/features/users/server/user-types";
import { UnauthorizedError } from "@/lib/Errors";
import { logger } from "@/lib/logging/winston";
import { stripe } from "@/lib/stripe";
import { toYMD } from "@/lib/utils";
import { subYears } from "date-fns";
import { eq } from "drizzle-orm";
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
        columns: {
          emailVerified: true,
          email: true,
          image: true,
          name: true,
          stripeCustomerId: true,
          role: true,
        },
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
          ? "https://solveit.up.railway.app"
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
    await CreateUserStripeConnectAccount({ ...values, dob }, user); //==> synchronous job
    revalidateTag(`user-${user.id}`);
  } catch (error) {
    logger.error("unable to save user details", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("something went wrong");
  }
}
export async function refundPoster(taskPaymentId: string) {
  console.warn("passed task payemnt :", taskPaymentId);
  try {
    const res = await db.query.PaymentTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, taskPaymentId),
      columns: { stripeChargeId: true, amount: true, id: true },
    });
    console.log("found ", res);
    if (res?.stripeChargeId) {
      const st = await stripe.refunds.create({
        charge: res.stripeChargeId,
      });
      if (st.status == "succeeded") {
        const rf = await db
          .update(RefundTable)
          .set({
            refundedAt: new Date(),
            refundStatus: "REFUNDED",
          })
          .where(eq(RefundTable.paymentId, taskPaymentId))
          .returning();
        console.warn("after rf update ", rf);
        const py = await db
          .update(PaymentTable)
          .set({ status: "REFUNDED" })
          .where(eq(PaymentTable.id, taskPaymentId))
          .returning();
        console.warn("after py update ", py);
      }
    } else {
      throw new Error("no match found for this payment");
    }
  } catch (error) {
    console.log(error);
    throw new Error("unable to release this fund try again");
  }
}
