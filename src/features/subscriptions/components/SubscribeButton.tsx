// components/SubscribeButton.tsx
"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SubscribeButton({
  tier,
  currentTier,
}: {
  tier: "BASIC" | "PREMIUM";
  currentTier?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending || currentTier === tier}
      variant={
        currentTier === tier
          ? "default"
          : tier === "PREMIUM"
          ? "default"
          : "outline"
      }>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : currentTier === tier ? (
        "Current Plan"
      ) : tier === "PREMIUM" ? (
        "Subscribe Now"
      ) : (
        "Get Started"
      )}
    </Button>
  );
}
