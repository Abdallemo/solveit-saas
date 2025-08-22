import { env } from "@/env/server";
import { UploadedFileMeta } from "@/features/media/server/media-types";

import {
  createTaskAction,
  deleteDraftTask,
  getDraftTask,
  taskPaymentInsetion,
} from "@/features/tasks/server/action";
import { stripe, SubMap } from "@/lib/stripe";
import { NextRequest } from "next/server";

import {
  CancelUserSubscription,
  updateUserSubscription,
} from "@/features/subscriptions/server/action";

import { eq } from "drizzle-orm";
import { UserSubscriptionTable } from "@/drizzle/schemas";
import type Stripe from "stripe";
import { logger } from "@/lib/logging/winston";
import { getUserById, UpdateUserField } from "@/features/users/server/actions";
import { getServerUserSession } from "@/features/auth/server/actions";
import { getPaymentByPaymentIntentId } from "@/features/payments/server/action";

export async function GET() {
  return new Response("Webhook route is active", { status: 200 });
}
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const sig = request.headers.get("stripe-signature") as string;
    const secret = env.STRIPE_WEBHOOK_SECRET;
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, sig, secret);
    const userSession = await getServerUserSession();
    switch (event.type) {
      case "checkout.session.completed":
        await handleTaskCreate(event);
        break;
      case "payment_method.updated":
        console.log(event);
        const paymentMethod = event.data.object;
        const res = await stripe.paymentMethods.update(paymentMethod.id, {
          allow_redisplay: "always",
          billing_details: {
            name: userSession?.name!,
            email: userSession?.email!,
          },
        });

        console.log("res", res);
        break;
      case "customer.subscription.updated":
        await handleUpdate(event.data.object);
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
  } catch (error) {
    logger.error("internal Error on Stripe Webhook", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return new Response(null, { status: 500 });
  }
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

    logger.info("Inserting subscription for user:", { userId: userId });
    console.log("---------------customer Id: " + customerId);
    await updateUserSubscription(
      {
        tier: "SOLVER",
        userId: userId,
        stripeSubscriptionId: sub.id,
        stripeSubscriptionItemId: sub.items.data[0].id,
      },
      "SOLVER",
      userId,
      customerId
    );
  } catch (err) {
    logger.error("Failed to handle subscription creation:", { error: err });
    throw err;
  }
}
async function handleUpdate(subscription: Stripe.Subscription) {
  const tierSelected = SubMap[subscription.items.data[0].plan.id];
  const userId = subscription.metadata.userId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  console.log("TIER TO :", tierSelected);
  if (tierSelected === undefined) {
    logger.warn("Unknown price ID in subscription update:");
    return;
  }
  if (!userId) {
    logger.warn("undefined userId :");
    return;
  }
  await updateUserSubscription(
    {
      tier: tierSelected,
      userId,
    },
    "SOLVER",
    userId,
    customerId
  );
}
async function handleDelete(subscription: Stripe.Subscription) {
  const customer = subscription.customer;
  const customerId = typeof customer === "string" ? customer : customer.id;
  const userId = subscription.metadata.userId;

  logger.info("Handling subscription deletion for user:" + userId);

  await CancelUserSubscription(
    eq(UserSubscriptionTable.stripeSubscriptionId, subscription.id),
    {
      stripeSubscriptionId: null,
      stripeSubscriptionItemId: null,
      tier: "POSTER",
      userId: userId,
    }
  );
}

async function handleTaskCreate(event: Stripe.Event) {
  if (event.type !== "checkout.session.completed") return;
  try {
    const session = event.data.object;
    const userId = event?.data.object?.metadata?.userId;
    const draftTaskId = event?.data.object?.metadata?.draftTaskId;
    const paymentIntentId = session.payment_intent as string;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const customerId =
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer?.id;

    const paymentMethodId =
      typeof paymentIntent.payment_method === "string"
        ? paymentIntent.payment_method
        : paymentIntent.payment_method?.id;
    

    if (!userId || !draftTaskId || !customerId) {
      logger.warn("couldnt found userId or DraftId " + userId);
      return;
    }
    const draftTasks = await getDraftTask(userId, draftTaskId);
    if (!draftTasks) {
      logger.warn("unable to find any draft task for this user: " + userId);
      return;
    }
    await UpdateUserField({
      id: userId,
      data: { stripeCustomerId: customerId },
    });

    logger.info(`paymentMethodId for user ${userId} is : ${paymentMethodId}`);

    await stripe.paymentMethods.update(paymentMethodId!, {
      allow_redisplay: "always",
    });
    const paymentExist = await getPaymentByPaymentIntentId(paymentIntentId);

    if (paymentExist) {
      logger.warn(
        `PaymentIntent ${paymentIntentId} already processed, skipping`
      );
      return;
    }

    const amount = session.amount_total! / 100;
    const paymentId = await taskPaymentInsetion(
      "HOLD",
      amount,
      userId,
      paymentIntentId,
      "Task Payment"
    );
    if (!paymentId) {
      logger.warn("unable to insert paymentIntent for the payment table ");
      return;
    }

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
    ) {
      logger.warn("All task fields are requried");
      return;
    }

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
    logger.error("Failed To handle Task Creatio", {
      error: error,
      stripeEventId: event.id,
    });
    throw new Error(
      "Task Handle Webhook Failed due to: " + (error as Error).message
    );
  }
}
