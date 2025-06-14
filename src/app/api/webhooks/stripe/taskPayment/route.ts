import { env } from "@/env/server";
import { UploadedFileMeta } from "@/features/media/server/action";
import { generateTitleAndDescription } from "@/features/tasks/lib/utils";
import {
  createTaskAction,
  deleteDraftTask,
  getDraftTask,
  taskPaymentInsetion,
} from "@/features/tasks/server/action";
import { stripe } from "@/lib/stripe";
import { NextRequest } from "next/server";
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
      try {
        const session = event.data.object;
        const userId = event?.data.object?.metadata?.userId;
        const paymentIntentId = session.payment_intent as string;
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );
        if (!userId) return;
        console.log("user is there")
        const amount = session.amount_total! / 100;
        console.log("Saving into Payment table")

        const paymentId = await taskPaymentInsetion(
          "PENDING",
          amount,
          userId,
          "Task Payment",
          paymentIntentId
        );

        if (!paymentId) return;
        console.log("retreving from draft table")

        const draftTasks = await getDraftTask(userId);

        if (!draftTasks) return;
        const {
          category,
          content,
          deadline,
          price,
          uploadedFiles,
          visibility,
        } = draftTasks;

        if (!category || !content || !deadline || !price || !visibility)
          return { error: { messgae: "somefield arent met the regulation " } };

        const { title, description } = generateTitleAndDescription(content);
        console.log("starting creat Task prosess")

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
          paymentId,
    
        );

        //cleaning 
        await deleteDraftTask(userId);
      } catch (error) {
        console.error(error)
      }

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
  return new Response(null, { status: 200 });
}
