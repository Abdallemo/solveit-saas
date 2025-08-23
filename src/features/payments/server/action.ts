"use server";

import db from "@/drizzle/db";
import { getServerUserSession } from "@/features/auth/server/actions";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import { getUserById } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
export type cardsType = Awaited<
  ReturnType<typeof getAllCustomerPaymentMethods>
>;
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
        allowed_updates:["address"]
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
    configuration:configuration.id
  });
  return portalSession.url;
}

export async function getPaymentByPaymentIntentId(stripePaymentIntentId:string) {
  return await db.query.PaymentTable.findFirst({
    where:(tb,fn)=>fn.eq(tb.stripePaymentIntentId,stripePaymentIntentId)
  })
  
}