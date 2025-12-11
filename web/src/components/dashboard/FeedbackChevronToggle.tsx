"use client";

import { cn } from "@/lib/utils/utils";
import { ChevronUp, Star } from "lucide-react";

export function FeedbackChevronToggle({
  onExpandBanner,
}: {
  onExpandBanner: () => void;
}) {
  return (
    <div
      onClick={onExpandBanner}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-1",
        "px-3 py-1.5",
        "rounded-full shadow-md",
        "bg-white/95 border border-gray-200",
        "cursor-pointer select-none",
        "hover:bg-white transition-all",
      )}
    >
      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      <ChevronUp className="h-4 w-4 text-gray-600" />
    </div>
  );
}
