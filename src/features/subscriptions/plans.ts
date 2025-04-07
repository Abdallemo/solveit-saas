
export type Plan = {
    name: string;
    price: string;
    priceInCents: number;
    stripePriceId: string;
    features: string[];
  };
  
  export const plans: Plan[] = [
    {
      name: "Poster",
      price: "RM0",
      priceInCents: 0,
      stripePriceId: "",
      features: [
        "Unlimited task postings",
        "AI-powered task categorization",
        "AI-generated pricing suggestions",
        "View solver profiles & reviews",
        "Real-time notification system",
      ],
    },
    {
      name: "Solver",
      price: "RM15",
      priceInCents: 1500, 
      stripePriceId: "",
      features: [
        "Access to all posted tasks",
        "Earn money by completing tasks",
        "Reputation-based ranking system",
        "Advertise mentoring services",
        "Task filtering and smart recommendations",
        "Priority support & verification badge",
      ],
    },
  ];
  