import { CardWrapper } from "@/components/card-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { UserRoleType } from "@/drizzle/schemas";
import useCurrentUser from "@/hooks/useCurrentUser";
import { AlertCircle, ArrowRight, Calendar, CheckCircle } from "lucide-react";
import React from "react";
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
                      {subscription.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscription.price} / {subscription.billingCycle}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <Billings />
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

function Billings() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Next billing date</span>
        </div>
        <span>{subscription.nextBillingDate}</span>
      </div>
    </div>
  );
}
function PlanChange({ role }: { role: UserRoleType | undefined }) {
  return (
    <div className="flex flex-col space-y-2 w-full">
      {role == "POSTER" && (
        <Button variant="outline" className="w-full justify-between">
          <span>Upgrade plan</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="outline"
        className="w-full justify-between text-muted-foreground">
        <span>Cancel subscription</span>
        <AlertCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
