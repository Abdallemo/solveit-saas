import { env } from "@/env/server";
import { UploadedFileMeta } from "@/features/media/server/action";

import {
  createTaskAction,
  deleteDraftTask,
  getDraftTask,
  taskPaymentInsetion,
} from "@/features/tasks/server/action";
import { stripe } from "@/lib/stripe";
import { NextRequest } from "next/server";

import {
  CancelUserSubscription,
  updateUserSubscription,
} from "@/features/subscriptions/server/action";

import { eq } from "drizzle-orm";
import { UserSubscriptionTable } from "@/drizzle/schemas";
import type Stripe from "stripe";

export async function GET() {
  return new Response("Webhook route is active", { status: 200 });
}
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  console.log("yo");
  const sig = request.headers.get("stripe-signature") as string;
  const secret = env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();
  const event = stripe.webhooks.constructEvent(body, sig, secret);
  switch (event.type) {
    case "checkout.session.completed":
      await handleTaskCreate(event)
      break;

    case "customer.subscription.updated":
      break;
    case "customer.subscription.created":
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
      stripeSubscriptionItemId: null,
      tier: "BASIC",
      userId: userId,
    }
  );
}

async function handleTaskCreate(event: Stripe.Event) {

  if (event.type !== "checkout.session.completed") return;
  try {
    const session = event.data.object;
    const userId = event?.data.object?.metadata?.userId;
    const paymentIntentId = session.payment_intent as string;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!userId) return;
    console.log("user is there");
    const amount = session.amount_total! / 100;
    console.log("Saving into Payment table");

    const paymentId = await taskPaymentInsetion(
      "PENDING",
      amount,
      userId,
      "Task Payment",
      paymentIntentId
    );

    if (!paymentId) return;
    console.log("retreving from draft table");

    const draftTasks = await getDraftTask(userId);

    if (!draftTasks) return;
    const {
      title,
      description,
      category,
      content,
      deadline,
      price,
      uploadedFiles,
      visibility,
    } = draftTasks;

    if (
      !category ||
      !content ||
      !deadline ||
      !price ||
      !visibility ||
      !description
    )
      return;

    console.log("starting creat Task prosess");

    await createTaskAction(
      userId,
      title,
      description,
      category,
      content,
      visibility,
      deadline,
      price,
      uploadedFiles as UploadedFileMeta[],
      paymentId
    );

    //cleaning
    await deleteDraftTask(userId);
  } catch (error) {
    console.error(error);
  }
}
