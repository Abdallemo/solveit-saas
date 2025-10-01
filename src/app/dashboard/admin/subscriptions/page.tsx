import { SubscriptionManagement } from "@/features/subscriptions/components/SubscriptionManagement";

import { getAllSubscriptions } from "@/features/subscriptions/server/db";

export default async function page() {
  const subscriptions = await getAllSubscriptions();

  return <SubscriptionManagement subscription={subscriptions} />;
}
