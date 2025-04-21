"use server";

import { getServerUserSession } from "@/features/auth/server/actions";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import { plans } from "@/features/subscriptions/plans";
import { redirect } from "next/navigation";

import { TierType } from "@/drizzle/schemas";
import { env } from "@/env/server";
import { headers } from "next/headers";
import * as db from "@/features/subscriptions/server/db";
import Stripe from "stripe";
export const {
  CancelUserSubscription,
  CreateUserSubsciption,
  updateUserSubscription,
} = db;

export async function getServerReturnUrl() {
  const headersList = await headers();
  const referer =
    headersList.get("referer") ?? `${env.NEXTAUTH_URL}/dashboard/`;
  return referer;
}

export async function createStripeCheckoutSession(tier: TierType) {
  const referer = await getServerReturnUrl();
  try {
    const currentUser = await getServerUserSession();
    if (!currentUser?.id) redirect("/login");
    const userSubscription = await getServerUserSubscriptionById(
      currentUser?.id!
    );

    const selectedPlan = plans.find((plan) => plan.teir === tier);
    if (!selectedPlan) throw new Error("Plan not found");

    if (!currentUser.email || !currentUser!.id) return;
    if (userSubscription?.tier == "PREMIUM") return; //chnaged here to test
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: currentUser!.email,
      success_url: referer,
      cancel_url: referer,
      line_items: [
        {
          price: selectedPlan.stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          userId: currentUser!.id,
        },
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    console.log("session url" + session.url);
    redirect(session.url);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createCancelSession() {
  const user = await getServerUserSession();
  const referer = await getServerReturnUrl();

  if (!user) redirect("/login");

  const { id } = user;
  console.log('before user id')
  const subscription = await getServerUserSubscriptionById(id);
  
  
  if (!subscription?.stripeCustomerId || !subscription.stripeSubscriptionId)
    return;

  let portalSession:Stripe.Response<Stripe.BillingPortal.Session>;
  try {
    portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: referer,
      flow_data: {
        type: "subscription_cancel",
        subscription_cancel: {
          subscription: subscription.stripeSubscriptionId,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.message?.includes("No such subscription")
    ) {
      console.warn("Subscription does not exist on Stripe.");
      return {error:"already subscriped"};
    }

    console.error("Stripe error:", error);
    return;
  }

  
  redirect(portalSession.url);
}

export async function CreateUserSessionPortal() {
  const { id } = (await getServerUserSession())!;
  const referer = await getServerReturnUrl();

  if (id == null) return;
  const subscription = await getServerUserSubscriptionById(id);

  if (subscription?.stripeCustomerId == null) return;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: referer,
  });
  return portalSession.url;
}
