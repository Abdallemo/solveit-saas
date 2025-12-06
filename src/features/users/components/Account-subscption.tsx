"use client";
import { CardWrapper } from "@/components/card-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TierType } from "@/drizzle/schemas";
import { CreateUserSubSessionPortal } from "@/features/subscriptions/server/action";
import { useStripeSubscription } from "@/hooks/provider/stripe-subscription-provider";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Calendar, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
export default function AccountSubscption() {
  const { subTier, price } = useStripeSubscription();

  const { user } = useCurrentUser();
  const { role } = user;

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
                    <p className="text-sm font-medium">
                      {subTier.toLowerCase()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {role !== "POSTER" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    RM{price} / monthly
                  </p>
                </div>
              </div>
              <Billings tier={subTier} />
            </div>
          ),
        },
      ]}
      footer={<PlanChange tier={subTier} />}
      footerClassName="flex flex-col h-full w-full"
      className=""
    />
  );
}

function Billings({ tier }: { tier: TierType }) {
  const { cancelAt, isCancelScheduled, status, nextBilling } =
    useStripeSubscription();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        {tier !== "POSTER" && (
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
function PlanChange({ tier }: { tier: TierType }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { cancelAt, isCancelScheduled, status } = useStripeSubscription();

  return (
    <div className="flex flex-col space-y-2 w-full">
      {tier !== "POSTER" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            startTransition(async () => {
              const url = (await CreateUserSubSessionPortal())!;
              router.push(url);
            })
          }
        >
          {isPending ? <Loader2 className="animate-spin" /> : "Manage"}
        </Button>
      ) : null}
    </div>
  );
}
