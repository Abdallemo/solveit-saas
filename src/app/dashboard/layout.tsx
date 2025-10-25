import { ReactNode, Suspense } from "react";

import { isAuthorized } from "@/features/auth/server/actions";
import { getAllNotification } from "@/features/notifications/server/action";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { DashboardClientProviders } from "@/hooks/provider/DashboardClientProviders";
import { StripeSubscriptionContextType } from "@/hooks/provider/stripe-subscription-provider";
import { cookies } from "next/headers";
import DashboardSkeleton from "./loading";
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
      try {
        const subscription = await getServerUserSubscriptionById(user.id);

        if (subscription && subscription.stripeSubscriptionId) {
          return {
            cancelAt: subscription.cancelAt,
            isCancelScheduled: subscription.isCancelScheduled,
            status: subscription.status,
            nextBilling: subscription.nextBilling,
            subTier: subscription.tier,
            price: subscription.price,
          } as StripeSubscriptionContextType;
        }
        return null;
      } catch (e) {
        console.error("Failed to fetch solver subscription data:", e);

        return null;
      }
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
    <DashboardClientProviders
      stripeData={finalStripeData}
      defaultSidebarOpen={defaultOpen}
      serverProps={{
        user: user,
        sessionUser: session?.user,
        allNotifications: allNotifications,
      }}>
      {children}
    </DashboardClientProviders>
  );
}
