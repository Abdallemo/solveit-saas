import React, { ReactNode, Suspense } from "react";

import BridCarmComponent from "@/components/BridCarmComponent";
import OnboardingForm from "@/components/dashboard/user-onboarding-lazyloaded";
import WalletDropdownMenu from "@/components/dashboard/WalletDropdownMenu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import { Motion3DBackground } from "@/features/auth/components/feature-panel";
import { isAuthorized } from "@/features/auth/server/actions";
import NotificationDropDown from "@/features/notifications/components/notificationDropDown";
import { getAllNotification } from "@/features/notifications/server/action";
import DashboardSidebar from "@/features/users/components/DashboardSidebar";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import {
  StripeSubscriptionContextType,
  StripeSubscriptionProvider,
} from "@/hooks/provider/stripe-subscription-provider";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import DashboardSkeleton, { AppSidebarSkeleton } from "./loading";
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
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

async function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { user, session } = await isAuthorized(
    ["ADMIN", "MODERATOR", "POSTER", "SOLVER"],
    { useCache: false }
  );

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const allNotificationsPromise = getAllNotification(user.id);

  let subscriptionPromise: Promise<StripeSubscriptionContextType | null> | null =
    null;

  if (user.role === "SOLVER") {
    subscriptionPromise = (async () => {
      const subscription = await getServerUserSubscriptionById(user.id);

      if (subscription && subscription.stripeSubscriptionId) {
        return {
          cancelAt: subscription.cancelAt,
          isCancelScheduled: subscription.isCancelScheduled,
          status: subscription.status,
          nextBilling: subscription.nextBilling,
          subTier: subscription.tier,
          price: subscription.price,
        };
      }
      return null;
    })();
  }

  const [allNotifications, stripeData] = await Promise.all([
    allNotificationsPromise,
    subscriptionPromise,
  ]);

  const finalStripeData: StripeSubscriptionContextType = stripeData ?? {
    cancelAt: null,
    isCancelScheduled: false,
    status: "inactive",
    nextBilling: null,
    subTier: "POSTER",
    price: 0,
  };

  return (
    <SessionProvider
      session={session}
      basePath="/api/auth"
      refetchInterval={30 * 60}
      refetchOnWindowFocus={true}>
      <StripeSubscriptionProvider value={finalStripeData}>
        <SidebarProvider
          defaultOpen={defaultOpen}
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }>
          <ReactQueryProvider>
            {(user.role === "SOLVER" || user.role === "POSTER") &&
            !user?.userDetails.onboardingCompleted ? (
              <div className="relative flex flex-col justify-center items-center  h-screen w-full bg-gradient-to-br from-primary/5 via-background to-accent/10 overflow-hidden">
                <Motion3DBackground />
                <OnboardingForm />
              </div>
            ) : (
              <div className="flex h-screen w-full">
                <Suspense fallback={<AppSidebarSkeleton />}>
                  <DashboardSidebar user={session?.user!} />
                </Suspense>
                <div className="flex flex-col flex-1 ">
                  <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                    <div className=" flex h-14 items-center px-4 sm:px-6 justify-between">
                      <div className="flex items-center">
                        <SidebarTrigger className="mr-2" />
                        <BridCarmComponent />
                      </div>

                      <div className="flex gap-2 justify-center items-center">
                        {user.role === "SOLVER" && <WalletDropdownMenu />}
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
            )}
          </ReactQueryProvider>
        </SidebarProvider>
      </StripeSubscriptionProvider>
    </SessionProvider>
  );
}
