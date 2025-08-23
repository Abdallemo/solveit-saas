import React, { ReactNode } from "react";

import {
  getServerSession,
  getServerUserSession,
} from "@/features/auth/server/actions";
import {
  getServerUserSubscriptionById,
  getUserById,
} from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import {
  StripeSubscriptionContextType,
  StripeSubscriptionProvider,
} from "@/hooks/provider/stripe-subscription-provider";
import DashboardSidebar from "@/features/users/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import NotificationDropDown from "@/features/notifications/components/notificationDropDown";
import WalletDropdownMenu from "@/components/dashboard/WalletDropdownMenu";
import { getWalletInfo } from "@/features/tasks/server/action";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import BridCarmComponent from "@/components/BridCarmComponent";
import { getAllNotification } from "@/features/notifications/server/action";
const dbFlags = {
  monacoEditor: false,
  experimental3DViewer: false,
  aiSummarizer: false,
  pdfPreview: false,
} as const;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getServerUserSession();
  if (!user) {
    return redirect("/api/auth/signout?callbackUrl=/login");
  }
  const { id, role } = user;

  if (!id || !role) {
    return redirect("/api/auth/signout?callbackUrl=/login");
  }
  const userInDb = await getUserById(id);
  if (!userInDb) {
    return redirect(
      "/api/auth/signout?callbackUrl=/login?error=account_deleted"
    );
  }

  const subscription = await getServerUserSubscriptionById(id);
  let stripeData: StripeSubscriptionContextType = {
    cancelAt: null,
    isCancelScheduled: false,
    status: "inactive",
    nextBilling: null,
    subTier: subscription?.tier!,
    price: 0,
  };

  if (subscription?.stripeSubscriptionId) {
    const sub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    const price = sub.items.data[0].price.unit_amount
      ? sub.items.data[0].price.unit_amount / 100
      : 0;
    stripeData = {
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
      isCancelScheduled: sub.cancel_at_period_end,
      status: sub.status,
      nextBilling: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
      subTier: subscription.tier,
      price,
    };
  }
  const session = await getServerSession();
  if (!session?.user || !session.user.id) {
    return redirect("/api/auth/signout?callbackUrl=/login");
  }
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const { pending, availabel } = await getWalletInfo(session.user.id);
  const allNotifications = await getAllNotification(userInDb.id!);
  // logger.info("intial notificaion about to pass",allNotifications)
  return (
    <SessionProvider
      session={session}
      basePath="/api/auth"
      refetchInterval={30 * 60}
      refetchOnWindowFocus={true}>
      <StripeSubscriptionProvider value={stripeData}>
        <SidebarProvider
          defaultOpen={defaultOpen}
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }>
          <ReactQueryProvider>
            <div className="flex h-screen w-full">
              <DashboardSidebar user={session?.user!} />
              <div className="flex flex-col flex-1 ">
                <header className="sticky top-0 z-10 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 border-b">
                  <div className=" flex h-14 items-center px-4 sm:px-6 justify-between">
                    <div className="flex items-center">
                      <SidebarTrigger className="mr-2" />
                      <BridCarmComponent />
                    </div>

                    <div className="flex gap-2">
                      {user.role === "SOLVER" && (
                        <WalletDropdownMenu
                          availabel={availabel}
                          pending={pending}
                        />
                      )}
                      <NotificationDropDown
                        initailAllNotifications={allNotifications}
                      />
                    </div>
                  </div>
                </header>
                <FeatureFlagProvider flags={dbFlags}>
                  {children}
                </FeatureFlagProvider>
              </div>
            </div>
          </ReactQueryProvider>
        </SidebarProvider>
      </StripeSubscriptionProvider>
    </SessionProvider>
  );
}
