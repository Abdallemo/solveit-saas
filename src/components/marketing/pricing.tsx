"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubscribeButton } from "@/features/subscriptions/components/SubscribeButton";
import { Plan, plans } from "@/features/subscriptions/plans";
import {
  createCancelSession,
  createStripeCheckoutSession,
} from "@/features/subscriptions/server/action";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";

export default function Pricing() {
  const { user, state } = useCurrentUser();
  const { mutateAsync: cancelSubscriptionSession,isPending:isCanceling } = useMutation({
    mutationFn: createCancelSession,
  });
  const { mutateAsync: createSubscription,isPending:isCreating } = useMutation({
    mutationFn: createStripeCheckoutSession,
  });
  const { data: userSubscription } = useQuery({
    queryKey: [user?.id],
    queryFn: async () => {
      return await getServerUserSubscriptionById(user?.id) || null;
    },
  });
  const switchSubs = async (plan: Plan) => {
    switch (plan.teir) {
      case "POSTER":
        await cancelSubscriptionSession();
        break;
      case "SOLVER":
        await createSubscription(plan.teir);
        break;
      default:
        break;
    }
  };
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-3xl font-bold mt-2">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">
                    /month
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-2 mt-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
                <form className="w-full" action={async () => switchSubs(plan)}>
                  <SubscribeButton
                    tier={plan.teir}
                    currentTier={userSubscription?.tier}
                  />
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSkeleton() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex justify-center mb-12">
          <div className="h-9 w-64 rounded-lg bg-muted shimmer-wave" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className="flex flex-col justify-between h-full">
              <CardHeader>
                <div className="h-8 w-32 rounded-lg bg-muted shimmer-wave" />

                <div className="flex items-baseline gap-2 mt-2">
                  <div className="h-9 w-20 rounded-lg bg-muted shimmer-wave" />
                  <div className="h-5 w-16 rounded-lg bg-muted shimmer-wave" />
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-2 mt-4">
                  {plan.features.map((_, i) => (
                    <li key={i} className="flex items-center">
                      <div className="h-5 w-5 rounded bg-muted shimmer-wave mr-2" />
                      <div className="h-5 flex-1 rounded-lg bg-muted shimmer-wave" />
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto">
                <div className="w-full h-10 rounded-md bg-muted shimmer-wave" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
