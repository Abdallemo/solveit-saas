"use server";

import { getServerUserSession } from "@/features/auth/server/actions";
import {
  getServerUserSubscriptionById,
  getUserById,
  UpdateUserField,
} from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import { plans } from "@/features/subscriptions/plans";
import { redirect } from "next/navigation";

import { TierType } from "@/drizzle/schemas";
import { env } from "@/env/server";
import { headers } from "next/headers";
import * as db from "@/features/subscriptions/server/db";
import Stripe from "stripe";
import { logger } from "@/lib/logging/winston";
import { cache } from "react";
export const {
  CancelUserSubscription,
  CreateUserSubsciption,
  updateUserSubscription,
} = db;

export type Subscription = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  amount: number;
  currency: string;
  interval: "month" | "year";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
};

export async function getServerReturnUrl() {
  const headersList = await headers();
  const referer =
    headersList.get("referer") ?? `${env.NEXTAUTH_URL}/dashboard/`;
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
  const { id } = (await getServerUserSession())!;
  const referer = await getServerReturnUrl();

  if (!id) redirect("/login");

  logger.info("creating cancel Session for User: " + id, { userId: id });
  const user = await getUserById(id);
  if (!user || !user.id) return;

  const subscription = await getServerUserSubscriptionById(id);
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
export const getAllSubscriptionsCached = cache(async () => {
  return await getAllSubscriptions();
});
export async function getAllSubscriptions(): Promise<Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    limit: 10,
    expand: ["data.customer", "data.items.data.price"],
  });

  const results = await Promise.all(
    subscriptions.data.map(async (sub) => {
      const customer = sub.customer as Stripe.Customer;
      const item = sub.items.data[0];
      const price = item.price;

      const product = await stripe.products.retrieve(
        typeof price.product === "string" ? price.product : price.product.id
      );

      return {
        id: sub.id,
        customerId: customer.id,
        customerName: customer.name || "",
        customerEmail: customer.email || "",
        planName: product.name || "",
        status: sub.status as Subscription["status"],
        amount: price.unit_amount ? price.unit_amount / 100 : 0,
        currency: price.currency.toUpperCase(),
        interval: price.recurring?.interval as "month" | "year",
        currentPeriodStart: new Date(
          sub.current_period_start * 1000
        ).toISOString(),
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end
          ? new Date(sub.trial_end * 1000).toISOString()
          : undefined,
      };
    })
  );

  return results;
}
