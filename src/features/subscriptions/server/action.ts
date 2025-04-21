"use server";

import { getServerUserSession } from "@/features/auth/server/actions";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import { plans } from "@/features/subscriptions/plans";
import { redirect } from "next/navigation";

import { TierType, users, UserSubscriptionTable } from "@/drizzle/schemas";
import { env } from "@/env/server";
import db from "@/drizzle/db";
import { eq, SQL } from "drizzle-orm";
import { UserRole } from "../../../../types/next-auth";
import { headers } from "next/headers";

export async function createStripeCheckoutSession(tier: TierType) {
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
      success_url: `${env.NEXTAUTH_URL}/dashboard/`,
      cancel_url: `${env.NEXTAUTH_URL}/dashboard/?canceled=true`,
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

export async function updateUserSubscription(
  values: typeof UserSubscriptionTable.$inferInsert,
  role: UserRole = "SOLVER",
  id: string
) {
  await db.transaction(async (dx) => {
    await dx
      .update(UserSubscriptionTable)
      .set(values)
      .where(eq(UserSubscriptionTable.userId, id));
    await dx.update(users).set({ role: role }).where(eq(users.id, id));
  });
}
export async function CancelUserSubscription(
  where: SQL,
  values: typeof UserSubscriptionTable.$inferInsert,
  id?: string
) {
  await db.transaction(async (dx) => {
    await dx.update(UserSubscriptionTable).set(values).where(where);

    await dx.update(users).set({ role: "POSTER" }).where(eq(users.id, id!));
  });
}

export async function createCancelSession() {
  const user = await getServerUserSession();
  const headersList = await headers()
  const referer = headersList.get('referer') ?? `${env.NEXTAUTH_URL}/dashboard/`

  console.log("Hee referer : "+referer)

  if (!user) redirect('/login')

  const { id } = user;

  const subscription = await getServerUserSubscriptionById(id);

  if (subscription?.stripeCustomerId == null) return;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: referer,
    flow_data: {
      type: "subscription_cancel",
      subscription_cancel: {
        subscription: subscription.stripeSubscriptionId!,
      },
    },
  });

  redirect(portalSession.url);
}

export async function CreateUserSubsciption(
  values: typeof UserSubscriptionTable.$inferInsert
) {
  await db.insert(UserSubscriptionTable).values(values);
}
export async function CreateUserSessionPortal() {
  const { id } = (await getServerUserSession())!;

  if (id == null) return;
  const subscription = await getServerUserSubscriptionById(id);

  if (subscription?.stripeCustomerId == null) return;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${env.NEXTAUTH_URL}/dashboard/`,
  });
  return portalSession.url;
}
