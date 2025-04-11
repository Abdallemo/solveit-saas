import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { plans } from "@/features/subscriptions/plans";
import {
  createStripeCheckoutSession,
  createCancelSession,
} from "@/features/subscriptions/server/action";
import { getServerUserSession } from "@/features/auth/server/actions";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { SubscribeButton } from "@/features/subscriptions/components/SubscribeButton";

export default async function Pricing() {
  const currentUser = await getServerUserSession();
  const userSubscription = currentUser
    ? await getServerUserSubscriptionById(currentUser.id)
    : null;

  console.log("bug: CurrentUser " + currentUser?.id);
  console.log("bug: userSubscription " + userSubscription);

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className="flex flex-col justify-between">
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

              <CardFooter>
                {
                  <form
                    action={
                      plan.teir === "BASIC"
                        ? createCancelSession
                        : createStripeCheckoutSession.bind(null, plan.teir)
                    }>
                    <SubscribeButton
                      tier={plan.teir}
                      currentTier={userSubscription?.tier}
                    />
                  </form>
                }
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
