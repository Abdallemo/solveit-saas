// hooks/provider/stripe-subscription-provider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";

export type StripeSubscriptionContextType = {
  cancelAt: Date | null;
  isCancelScheduled: boolean;
  status: string;
  nextBilling:Date | null
};

const StripeSubscriptionContext = createContext<StripeSubscriptionContextType | null>(null);

export function useStripeSubscription() {
  const context = useContext(StripeSubscriptionContext);
  if (!context) {
    throw new Error("useStripeSubscription must be used within a StripeSubscriptionProvider");
  }
  return context;
}

export function StripeSubscriptionProvider({
  value,
  children,
}: {
  value: StripeSubscriptionContextType;
  children: ReactNode;
}) {
  return (
    <StripeSubscriptionContext.Provider value={value}>
      {children}
    </StripeSubscriptionContext.Provider>
  );
}
