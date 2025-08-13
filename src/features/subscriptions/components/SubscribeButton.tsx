// components/SubscribeButton.tsx
"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TierType } from "@/drizzle/schemas";
import { cn } from "@/lib/utils";

export function SubscribeButton({
  tier,
  currentTier,
  className,
}: {
  tier: TierType;
  currentTier?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={cn("w-full", className)}
      disabled={pending || currentTier === tier}
      variant={
        currentTier === tier
          ? "default"
          : tier === "SOLVER"
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
      ) : tier === "SOLVER" ? (
        "Get Started"
      ) : (
        "Get Started"
      )}
    </Button>
  );
}
