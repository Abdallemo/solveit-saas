"use server";

import db from "@/drizzle/db";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import { getUserById, UpdateUserField } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
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
  const urlprix = `/dashboard/${user.role?.toLocaleLowerCase()}/billings?user=${
    user.id
  }`;
  const session = await stripe.accountLinks.create({
    account: "",
    type: "account_onboarding",
    collect: "currently_due",
    return_url: urlprix,
    refresh_url: urlprix,
  });
  return redirect(session.url);
}
export async function CreateUserStripeConnectAccount(
  email: string,
  userId: string
) {
  const account = await stripe.accounts.create({
    type: "express",

    email: email,

    capabilities: {
      card_payments: {
        requested: true,
      },

      transfers: {
        requested: true,
      },
    },
    business_type: "individual",
    
  });

  await UpdateUserField({
    id: userId,
    data: { stripeAccountId: account.id },
  });
}
