"use server";

import db from "@/drizzle/db";
import { env } from "@/env/server";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import { getUserById, UpdateUserField } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import { User } from "next-auth";
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
  const { user, authorized } = await isAuthorized(["POSTER", "SOLVER"]);
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
    collection_options: {
      fields: "currently_due",
      future_requirements: "omit",
    },
  });
  console.log(`redirecting to ${session.url}`);
  return redirect(session.url);
}
export async function CreateUserStripeConnectAccount(user: User) {
  const account = await stripe.accounts.create({
    type: "standard",
    email: user.email!,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    individual: {
      first_name: user.name!,
      last_name: user.name!,
      email: user.email!,
      dob: {
        day: 1,
        month: 1,
        year: 1990,
      },
      address: {
        line1: "123 Test Street",
        city: "Kuala Lumpur",
        postal_code: "43000",
        state: "Selangor",
        country: "MY",
      },
    },
    business_profile: {
      mcc: "5734",
      product_description:
        "SolveIt is a student job board where students post and solve academic tasks.",
      url: env.NEXTAUTH_URL,
    },
  });
  console.log(account.id, account.type);

  await UpdateUserField({
    id: user.id!,
    data: { stripeAccountId: account.id },
  });
}
