// app/dashboard/layout.tsx (or wherever your layout lives)
import React, { ReactNode } from "react";

import { getServerUserSession } from "@/features/auth/server/actions";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import {
  StripeSubscriptionContextType,
  StripeSubscriptionProvider,
} from "@/hooks/provider/stripe-subscription-provider";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { id } = (await getServerUserSession())!;
  const subscription = await getServerUserSubscriptionById(id);
  let stripeData: StripeSubscriptionContextType = {
    cancelAt: null,
    isCancelScheduled: false,
    status: "inactive",
    nextBilling: null,
  };

  if (subscription?.stripeSubscriptionId) {
    const sub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    stripeData = {
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
      isCancelScheduled: sub.cancel_at_period_end,
      status: sub.status,
      nextBilling: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
    };
  }

  return (
    <StripeSubscriptionProvider value={stripeData}>
      {children}
    </StripeSubscriptionProvider>
  );
}
