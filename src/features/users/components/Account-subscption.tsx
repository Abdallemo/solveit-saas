"use client";
import { CardWrapper } from "@/components/card-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRoleType } from "@/drizzle/schemas";
import {
  createCancelSession,
  createStripeCheckoutSession,
  CreateUserSessionPortal,
} from "@/features/subscriptions/server/action";
import { useStripeSubscription } from "@/hooks/provider/stripe-subscription-provider";
import useCurrentUser from "@/hooks/useCurrentUser";
import { AlertCircle, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
const subscription = {
  name: "Pro Plan",
  status: "active",
  nextBillingDate: "May 11, 2025",
  price: "$19.99",
  billingCycle: "monthly",
  features: ["Unlimited posts", "Premium content", "Priority support"],
  usagePercent: 65,
};

export default function AccountSubscption() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { user } = useCurrentUser();
  const { email, id, image, name, role } = user!;

  return (
    <CardWrapper
      title="Subscription"
      sections={[
        {
          children: (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4 justify-between">
                <div>
                  {" "}
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{subscription.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {role !== "POSTER" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {role !== "POSTER" ? (
                    <p className="text-xs text-muted-foreground">
                      {role == "SOLVER" && "15RM"} / monthly
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {role == "POSTER" && "0RM"} / monthly
                    </p>
                  )}
                </div>
              </div>
              <Billings role={role} />
            </div>
          ),
        },
      ]}
      footer={<PlanChange role={role} />}
      footerClassName="flex flex-col h-full w-full"
      className=""
    />
  );
}

function Billings({ role }: { role: UserRoleType | undefined }) {
  const { cancelAt, isCancelScheduled, status, nextBilling } =
    useStripeSubscription();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        {role !== "POSTER" && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {isCancelScheduled ? (
              <span>subscription ends on</span>
            ) : (
              <span>Next billing date</span>
            )}
          </div>
        )}
        {isCancelScheduled ? (
          <span>{cancelAt?.toLocaleDateString()}</span>
        ) : (
          <span>{nextBilling?.toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
function PlanChange({ role }: { role: UserRoleType | undefined }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { cancelAt, isCancelScheduled, status } = useStripeSubscription();

  return (
    <div className="flex flex-col space-y-2 w-full">
      {role !== "POSTER" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            startTransition(async () => {
              const url = (await CreateUserSessionPortal())!;
              router.push(url);
            })
          }>
          {isPending ? <Loader2 className="animate-spin" /> : "Manage"}
        </Button>
      ) : null}
    </div>
  );
}
