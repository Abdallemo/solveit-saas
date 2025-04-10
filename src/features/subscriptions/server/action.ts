// "use server";

// import { getServerUserSession } from "@/features/auth/server/actions";
// import { getServerUserSubscriptionById } from "@/features/users/server/actions";
// import { stripe } from "@/lib/stripe";
// import { plans } from "@/features/subscriptions/plans";
// import { redirect } from "next/navigation";
// import { headers } from "next/headers";
// import { TierType } from "@/drizzle/schemas";

// export async function createStripeCheckoutSession(tier: TierType) {
//   try {
//     const currentUser = await getServerUserSession();
//     if (!currentUser?.id) redirect("/login");
//     const userSubscription = await getServerUserSubscriptionById(
//       currentUser?.id!
//     );
//     const selectedPlan = plans.find((plan) => plan.teir === tier);
//     if (!selectedPlan) throw new Error("Plan not found");

//     const headersList = headers();
//     const origin = (await headersList).get("origin") || "";

//     if (!currentUser.email || !currentUser!.id) return;

//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       customer_email: currentUser!.email,
//       success_url: `${origin}/dashboard/`,
//       cancel_url: `${origin}/subscription-error/?canceled=true`,
//       line_items: [
//         {
//           price: selectedPlan.stripePriceId,
//           quantity: 1,
//         },
//       ],
//       subscription_data: {
//         metadata: {
//           userId: currentUser!.id,
//         },
//       },
//     });

//     if (!session.url) throw new Error("Failed to create checkout session");
//     console.log("session url" + session.url);
//     redirect(session.url);
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

// export async function createCancelSession() {
//   try {
//     return;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }
