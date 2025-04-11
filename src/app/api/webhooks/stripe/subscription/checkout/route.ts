
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import db from "@/drizzle/db";

import { TierType, UserSubscriptionTable } from "@/drizzle/schemas";
import Stripe from "stripe";
import { updateUserSubscription } from "@/features/subscriptions/server/action";
export async function GET() {
  return new Response("Webhook route is active", { status: 200 });
}

export async function POST(request: NextRequest) {
  console.log("yoooooooooooooo does this reached here ....");
  const sig = request.headers.get("stripe-signature") as string;
  const secret =
    "whsec_48288fbdc0cee24401863d94b3cea8d346ea401ceb7310fcf50ac88c11e3d841";
  const body = await request.text();
  const event = stripe.webhooks.constructEvent(body, sig, secret);

  switch (event.type) {
    case "customer.subscription.updated":
      console.log("customer.subscription.updated");
      break;
    case "customer.subscription.created":
      console.log("trigred customer.subscription.created");
      await handleCreate(event.data.object);
      break;

    case "invoice.payment_succeeded":
      if (event.data.object.billing_reason === "subscription_create") {
        await handleCreate(event.data.object.subscription!);
      }
      console.log("trigred invoice.payment_succeeded");

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return new Response(null, { status: 200 });
}

async function handleCreate(subscription: string | Stripe.Subscription) {
  try {
    const sub =
      typeof subscription === "string"
        ? await stripe.subscriptions.retrieve(subscription)
        : subscription;

    const userId = sub.metadata.userId;
    if (!userId) {
      console.error("No userId in subscription metadata");
      return;
    }

    const customer = sub.customer;
    const customerId = typeof customer === "string" ? customer : customer.id;

    console.log("Inserting subscription for user:", userId);

    const result = await updateUserSubscription({
      tier: "PREMIUM",
      userId: userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      stripeSubscriptionItemId: sub.items.data[0].id,
    });

    console.log("Insert result:", result);
  } catch (err) {
    console.error("Failed to handle subscription creation:", err);
    throw err;
  }
}
