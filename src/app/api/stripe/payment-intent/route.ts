import { stripe } from "@/lib/stripe";
import { NextRequest } from "next/server";
import { getServerUserSession } from "@/features/auth/server/actions";
import { UpdateUserField, getUserById } from "@/features/users/server/actions";
import { logger } from "@/lib/logging/winston";

export async function POST(req: NextRequest) {
  try {
    const { price, userId, deadlineStr } = await req.json();

    const currentUser = await getServerUserSession();
    if (!currentUser?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: currentUser.email!,
        name: user.name ?? "",
        metadata: { userId },
      });
      customerId = customer.id;

      await UpdateUserField({
        id: user.id,
        data: { stripeCustomerId: customerId },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: "myr",
      customer: customerId,
      receipt_email: user.email!,
      payment_method_types: ["card"],
      setup_future_usage: "off_session",

      metadata: {
        userId,
        deadlineStr,
      },
    });
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2022-11-15" }
    );

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      customer: customerId,
      ephemeralKey: ephemeralKey.secret,
    });
  } catch (error) {
    logger.error("internal error", error);
    return Response.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
