import React, { ReactNode } from "react";

import {
  getServerSession,
  getServerUserSession,
} from "@/features/auth/server/actions";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import {
  StripeSubscriptionContextType,
  StripeSubscriptionProvider,
} from "@/hooks/provider/stripe-subscription-provider";
import DashboardSidebar from "@/features/users/components/PosterDashbaordSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";

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
  const session = await getServerSession();

  return (
    <SessionProvider session={session}>
      <StripeSubscriptionProvider value={stripeData}>
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <DashboardSidebar />
            <div className="flex flex-col flex-1 overflow-auto">
              <header className="sticky top-0 z-10 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 border-b">
                <div className="container flex h-14 items-center px-4 sm:px-6">
                  <SidebarTrigger className="mr-2" />
                </div>
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </StripeSubscriptionProvider>
    </SessionProvider>
  );
}
