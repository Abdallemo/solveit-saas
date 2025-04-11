import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  CreditCard,
} from "lucide-react";
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
  return (
    <>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Subscription</h2>
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
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
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Next billing date</span>
              </div>
              <span>{subscription.nextBillingDate}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Payment method</span>
              </div>
              <span>•••• 4242</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Plan features</p>
            <ul className="space-y-1">
              {subscription.features.map((feature, index) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium">Usage</p>
              <span>{subscription.usagePercent}%</span>
            </div>
            <Progress value={subscription.usagePercent} className="h-2" />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button variant="outline" className="justify-between">
            <span>Upgrade plan</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="justify-between text-muted-foreground">
            <span>Cancel subscription</span>
            <AlertCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </>
  );
}
