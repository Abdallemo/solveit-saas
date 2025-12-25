"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebarSkeleton } from "@/app/dashboard/loading";
import BridCarmComponent from "@/components/BridCarmComponent";
import OnboardingForm from "@/components/dashboard/user-onboarding-lazyloaded";
import WalletDropdownMenu from "@/components/dashboard/WalletDropdownMenu";
import { Motion3DBackground } from "@/features/auth/components/feature-panel";
import NotificationDropDown, {
  Message,
} from "@/features/notifications/components/notificationDropDown";
import DashboardSidebar from "@/features/users/components/DashboardSidebar";
import { TermsOfServiceDialog } from "@/components/marketing/terms-of-service-dialog";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import {
  StripeSubscriptionContextType,
  StripeSubscriptionProvider,
} from "@/hooks/provider/stripe-subscription-provider";

import { User, UserRole } from "@/features/users/server/user-types";
import { UpdateUserField } from "@/features/users/server/actions";
import { hasAccess } from "@/features/auth/server/auth-uitls";
import { useIsMounted } from "../useIsMounted";

const dbFlags = {
  monacoEditor: false,
  experimental3DViewer: false,
  aiSummarizer: false,
  pdfPreview: false,
} as const;

const CUSTOMER_ROLES: UserRole[] = ["POSTER", "SOLVER"];

interface UserSessionProps {
  user: User;
  allNotifications: Message[];
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
  const isMounted = useIsMounted();
  const router = useRouter();
  const { user, allNotifications } = serverProps;

  const { mutateAsync: handleAccept, isPending } = useMutation({
    mutationFn: async () => {
      await UpdateUserField(
        { id: user.id },
        { metadata: { agreedOnTerms: true } },
      );
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  const sidebarStyles = {
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12)",
  } as React.CSSProperties;

  const isStandardUser = hasAccess(user.role, CUSTOMER_ROLES);
  const needsOnboarding = isStandardUser && !user.metadata.onboardingCompleted;
  const needsTerms = isStandardUser && !user.metadata.agreedOnTerms;

  const FullScreenFlow = ({ children }: { children: React.ReactNode }) => (
    <div className="relative flex flex-col justify-center items-center h-screen w-full bg-linear-to-br from-primary/5 via-background to-accent/10 overflow-hidden">
      <Motion3DBackground />
      {children}
    </div>
  );

  const renderContent = () => {
    if (needsOnboarding) {
      return (
        <FullScreenFlow>
          <OnboardingForm />
        </FullScreenFlow>
      );
    }

    if (needsTerms) {
      return (
        <FullScreenFlow>
          <TermsOfServiceDialog onAccept={handleAccept} isPending={isPending} />
        </FullScreenFlow>
      );
    }

    return (
      <div className="flex h-screen w-screen">
        <Suspense fallback={<AppSidebarSkeleton />}>
          <DashboardSidebar user={user} />
        </Suspense>

        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
            <div className="flex h-14 items-center px-4 sm:px-6 justify-between">
              <div className="flex items-center">
                <SidebarTrigger className="mr-2" />
                <BridCarmComponent userRole={user.role} />
              </div>

              <div className="flex gap-2 justify-center items-center">
                {user.role === "SOLVER" && isMounted && (
                  <WalletDropdownMenu user={user} />
                )}
                <NotificationDropDown user={user} />
              </div>
            </div>
          </header>

          <FeatureFlagProvider flags={dbFlags}>
            <main className="flex-1 overflow-auto">{children}</main>
          </FeatureFlagProvider>
        </div>
      </div>
    );
  };

  return (
    <StripeSubscriptionProvider value={stripeData}>
      <NotificationProvider
        user={user}
        initailAllNotifications={allNotifications}
      >
        <SidebarProvider defaultOpen={defaultSidebarOpen} style={sidebarStyles}>
          {renderContent()}
        </SidebarProvider>
      </NotificationProvider>
    </StripeSubscriptionProvider>
  );
}
