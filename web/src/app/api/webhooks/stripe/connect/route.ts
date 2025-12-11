import { env } from "@/env/server";

import { stripe } from "@/lib/stripe";
import { NextRequest } from "next/server";

import { StripeAccountUpdateHanlder } from "@/features/users/server/actions";
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
  try {
    const sig = request.headers.get("stripe-signature") as string;
    const secret = env.STRIPE_CONNECT_WEBHOOK_SECRET;
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, sig, secret);
    switch (event.type) {
      case "account.updated":
        await StripeAccountUpdateHanlder(event.data.object);
        break;
      case "account.application.deauthorized":
        break;
      case "capability.updated":
        console.log(event.data.object);
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
