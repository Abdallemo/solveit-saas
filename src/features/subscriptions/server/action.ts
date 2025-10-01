"use server";

import { getServerUserSession } from "@/features/auth/server/actions";
import { plans } from "@/features/subscriptions/plans";
import {
  getServerUserSubscriptionById,
  getUserById,
  UpdateUserField,
} from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

import { TierType } from "@/drizzle/schemas";
import { env } from "@/env/server";
import * as db from "@/features/subscriptions/server/db";
import { logger } from "@/lib/logging/winston";
import { headers } from "next/headers";
import Stripe from "stripe";
export const {
  CancelUserSubscription,
  CreateUserSubsciption,
  updateUserSubscription,
  getAllSubscriptions,
  
} = db;



export async function getServerReturnUrl() {
  const headersList = await headers();
  const fullUrl = headersList.get("x-full-url");
  let referer = headersList.get("referer");
  if (!referer || referer === fullUrl) {
    return `${env.NEXTAUTH_URL}/dashboard/`;
  }
  return referer;
}

export async function createStripeCheckoutSession(tier: TierType) {
  const referer = await getServerReturnUrl();
  try {
    const currentUser = await getServerUserSession(); //next_auth
    if (!currentUser?.id) redirect("/login");
    const userSubscription = await getServerUserSubscriptionById(
      currentUser?.id!
    );

    const selectedPlan = plans.find((plan) => plan.teir === tier);
    if (!selectedPlan) throw new Error("Plan not found");

    if (!currentUser.email || !currentUser!.id) return;
    if (userSubscription?.tier !== "POSTER") return;
    const user = await getUserById(currentUser.id!);
    if (!user || !user.id) return;
    if (!currentUser.email || !currentUser!.id) return;
    let customerId = user.stripeCustomerId;
    if (!user.stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        email: currentUser.email,
        name: user.name!,
        metadata: {
          userId: user.id,
        },
      });
      customerId = newCustomer.id;
      await UpdateUserField({
        id: user.id,
        data: { stripeCustomerId: customerId },
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId!,
      success_url: referer,
      cancel_url: referer,
      line_items: [
        {
          price: selectedPlan.stripePriceId,
          quantity: 1,
        },
      ],
      payment_method_collection: "if_required",
      payment_method_types: ["card"],
      subscription_data: {
        metadata: {
          userId: currentUser!.id,
        },
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");
    redirect(session.url);
  } catch (error) {
    logger.error("Stripe Checkout Session Failed", { error: error });
    console.error(error);
    throw error;
  }
}

export async function upgradeSolverToPlus(userId: string) {
  const return_url = await getServerReturnUrl();
  const user = await getUserById(userId);
  if (!user || !user.id) return;
  console.log("passed userid :", userId);
  const subscription = await getServerUserSubscriptionById(userId);
  if (
    !subscription?.stripeSubscriptionId ||
    !subscription?.stripeSubscriptionItemId
  ) {
    throw new Error("User does not have an active subscription");
  }

  const solverPlusPriceId = env.STRIPE_SOLVER_PLUS_PRICE_ID;
  console.log("found solver+ pirce id :", solverPlusPriceId);
  console.log(JSON.stringify(subscription));
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId!,
    return_url,
  });
  redirect(session.url);
}

export async function createCancelSession() {
  const referer = await getServerReturnUrl();
  const currentUser = await getServerUserSession(); //next_auth
  if (!currentUser?.id) redirect("/login");

  logger.info("creating cancel Session for User: " + currentUser.id, {
    userId: currentUser.id,
  });
  const user = await getUserById(currentUser.id);
  if (!user || !user.id) return;

  const subscription = await getServerUserSubscriptionById(currentUser.id);
  if (!subscription || !subscription.stripeSubscriptionId) return;

  if (!user?.stripeCustomerId || !subscription.stripeSubscriptionId) return;

  let portalSession: Stripe.Response<Stripe.BillingPortal.Session>;
  try {
    portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
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
      return { error: "already subscriped" };
    }

    console.error("Stripe error:", error);
    return;
  }

  redirect(portalSession.url);
}

export async function CreateUserSubSessionPortal() {
  const { id } = (await getServerUserSession())!;
  const referer = await getServerReturnUrl();
  if (id == null) return;
  const user = await getUserById(id);

  if (user?.stripeCustomerId == null) return;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user?.stripeCustomerId,
    return_url: referer,
  });
  return portalSession.url;
}
