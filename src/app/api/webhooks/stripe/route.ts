import { env } from "@/env/server";
import { UploadedFileMeta } from "@/features/media/server/media-types";

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
import { logger } from "@/lib/logging/winston";

export async function GET() {
  return new Response("Webhook route is active", { status: 200 });
}
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  logger.info("Stripe Webhook Success Hit")
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
      logger.debug(`Unhandled event type ${event.type}`);
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
      logger.error("No userId in subscription metadata");
      return;
    }
    const customer = sub.customer;
    const customerId = typeof customer === "string" ? customer : customer.id;

    logger.info("Inserting subscription for user:", {userId:userId});

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
    logger.error("Failed to handle subscription creation:", {error:err});
    throw err;
  }
}

async function handleDelete(subscription: Stripe.Subscription) {
  const customer = subscription.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;
  const userId = subscription.metadata.userId;
  logger.info("Handling subscription deletion for user:"+userId );

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
    logger.info("found userId:"+userId)
    if (!userId) return;
    const amount = session.amount_total! / 100;
    const paymentId = await taskPaymentInsetion(
      "HOLD",
      amount,
      userId,
      "Task Payment",
      paymentIntentId
    );
    if (!paymentId) return;

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

    
  } catch (error) {
    logger.error("Failed To handle Task Creatio",{error:error,stripeEventId:event.id})
  }
}
