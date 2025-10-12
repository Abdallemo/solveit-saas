import { TierType } from "@/drizzle/schemas";

export type Plan = {
  name: string;
  price: string;
  priceInCents: number;
  features: string[];
  teir: TierType;
};

export const plans: Plan[] = [
  {
    name: "Poster",
    price: "RM0",
    priceInCents: 0,
    features: [
      "Unlimited task postings",
      "AI-powered task categorization",
      "AI-generated pricing suggestions",
      "View solver profiles & reviews",
      "Real-time notification system",
    ],
    teir: "POSTER",
  },
  {
    name: "Solver",
    price: "RM15",
    priceInCents: 1500,
    features: [
      "Access to all posted tasks",
      "Earn money by completing tasks",
      "Reputation-based ranking system",
      "Advertise mentoring services",
      "Task filtering and smart recommendations",
      "Priority support & verification badge",
    ],
    teir: "SOLVER",
  },
];
