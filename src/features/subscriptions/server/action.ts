// "use server"
// import { getServerUserSession } from "@/features/auth/server/actions";
// import { getServerUserSubscriptionById } from "@/features/users/server/actions";
// import { stripe } from "@/lib/stripe";
// import { subscription_tier, subscriptionTiers } from "../plans";
// import { AppUser } from "../../../../types/next-auth";
// import { redirect } from "next/navigation";
// import { headers } from "next/headers";

// export async function createStripeCheckoutSeesion(tier: subscription_tier) {
//   const currentUser = await getServerUserSession();
//   if (!currentUser || !currentUser.id || currentUser == null) return;
//   const UserSubscption = await getServerUserSubscriptionById(currentUser.id);

//   if (UserSubscption == null) return { error: "no user Subscrption" };

//   if (UserSubscption.stripeCustomerId == null) {
//     const url  = await getCheckoutSession(tier,currentUser)
//     if( url == null) return {error:"url is null"}
//     redirect(url)
//   } else {
//   }
// }

// async function getCheckoutSession(
//   tier: subscription_tier,
//   user: AppUser
// ) {
//      const headersList = await headers()
//         const origin = headersList.get('origin')
      
//     const session = await stripe.checkout.sessions.create({
//         mode: "subscription",
//         customer_email:user.email!,
//         success_url: `${origin}/dashboard/`,
  
//         cancel_url: `${origin}/?canceled=true`,
//         line_items: [
//           {
//             price: subscriptionTiers[tier].stripePriceId,
//             quantity: 1,
//           },
//         ],
//         subscription_data: {
//             metadata:{
//                 userId:user.id!
//             }
//         },
//       });
//       return session.url;
// }

// export async function createCancelSession (){}
// export async function createUserPortelSession (){}