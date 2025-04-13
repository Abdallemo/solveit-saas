import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import {
  CancelUserSubscription,
  updateUserSubscription,
} from "@/features/subscriptions/server/action";
import { env } from "@/env/server";
import { eq } from "drizzle-orm";
import { UserSubscriptionTable } from "@/drizzle/schemas";
export async function GET() {
  return new Response("Webhook route is active", { status: 200 });
}
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature") as string;
  const secret = env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();
  const event = stripe.webhooks.constructEvent(body, sig, secret);

  switch (event.type) {
    case "customer.subscription.updated":
      console.log("customer.subscription.updated");
      console.log("Scheduled cancellation at:", new Date(event.data.object.cancel_at! * 1000));
      break;
    case "customer.subscription.created":
      console.log("trigred customer.subscription.created");
      await handleCreate(event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleDelete(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
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

    await updateUserSubscription(
      {
        tier: "PREMIUM",
        userId: userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        stripeSubscriptionItemId: sub.items.data[0].id,
      },
      "SOLVER",
      userId
    );
  } catch (err) {
    console.error("Failed to handle subscription creation:", err);
    throw err;
  }
}

async function handleDelete(subscription: Stripe.Subscription) {
  const customer = subscription.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;
  const userId = subscription.metadata.userId;
  console.log("Handling subscription deletion for user:", userId);


  await CancelUserSubscription(
    eq(UserSubscriptionTable.stripeCustomerId, customerId),
    {
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeSubscriptionItemId:null,
      tier: "BASIC",
      userId: userId,
    }
  );
}
