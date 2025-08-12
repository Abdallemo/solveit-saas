export const revalidate = 300;
import { SubscriptionManagement } from "@/features/subscriptions/components/SubscriptionManagement";
import { getAllSubscriptions, getAllSubscriptionsCached } from "@/features/subscriptions/server/action";

export default async function page() {
  const subscriptions = await getAllSubscriptionsCached()
  
  return (

    <SubscriptionManagement subscription={subscriptions} />
  )
}