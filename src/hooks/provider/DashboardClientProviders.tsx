"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import {
  StripeSubscriptionContextType,
  StripeSubscriptionProvider,
} from "@/hooks/provider/stripe-subscription-provider";

import { AppSidebarSkeleton } from "@/app/dashboard/loading";
import BridCarmComponent from "@/components/BridCarmComponent";
import OnboardingForm from "@/components/dashboard/user-onboarding-lazyloaded";
import WalletDropdownMenu from "@/components/dashboard/WalletDropdownMenu";
import { Motion3DBackground } from "@/features/auth/components/feature-panel";
import NotificationDropDown from "@/features/notifications/components/notificationDropDown";
import DashboardSidebar from "@/features/users/components/DashboardSidebar";
import { Suspense } from "react";

const dbFlags = {
  monacoEditor: false,
  experimental3DViewer: false,
  aiSummarizer: false,
  pdfPreview: false,
} as const;

interface UserSessionProps {
  user: {
    id: string;
    role: "ADMIN" | "MODERATOR" | "POSTER" | "SOLVER";
    userDetails: {
      onboardingCompleted: boolean;
    };
  };
  sessionUser: any;
  allNotifications: any;
}

interface DashboardClientProvidersProps {
  children: React.ReactNode;
  stripeData: StripeSubscriptionContextType;
  defaultSidebarOpen: boolean;
  serverProps: UserSessionProps;
}

export function DashboardClientProviders({
  children,
  stripeData,
  defaultSidebarOpen,
  serverProps,
}: DashboardClientProvidersProps) {
  const { user, sessionUser, allNotifications } = serverProps;

  const sidebarStyles = {
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12)",
  } as React.CSSProperties;

  return (
    <StripeSubscriptionProvider value={stripeData}>
      <SidebarProvider defaultOpen={defaultSidebarOpen} style={sidebarStyles}>
        {(user.role === "SOLVER" || user.role === "POSTER") &&
        !user?.userDetails.onboardingCompleted ? (
          <div className="relative flex flex-col justify-center items-center h-screen w-full bg-gradient-to-br from-primary/5 via-background to-accent/10 overflow-hidden">
            <Motion3DBackground />
            <OnboardingForm />
          </div>
        ) : (
          <div className="flex h-screen w-full">
            <Suspense fallback={<AppSidebarSkeleton />}>
              <DashboardSidebar user={sessionUser} />
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
      </SidebarProvider>
    </StripeSubscriptionProvider>
  );
}
