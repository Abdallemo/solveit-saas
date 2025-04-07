import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basic",
    price: "RM0",
    features: [
      "5 team members",
      "10 projects",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "RM15",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20  w-full">
      <div className="flex flex-col items-center">
        <div className="w-full">
          <h2 className="text-3xl font-bold text-center mb-12">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-auto w-full">
            {plans.map((plan, index) => (
              <div key={index} className="bg-background p-8 rounded-lg shadow-md border-foreground/10 border">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <p className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-600">
                    /month
                  </span>
                </p>
                <ul className="mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center mb-2">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={index === 1 ? "default" : "outline"}>
                  {index === 2 ? "Contact Sales" : "Get Started"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
