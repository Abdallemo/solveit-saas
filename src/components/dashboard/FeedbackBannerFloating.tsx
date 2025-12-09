"use client";

import { cn } from "@/lib/utils/utils";
import { X } from "lucide-react";

export function FeedbackBannerFloating({
  onOpenModal,
  onCloseBanner,
}: {
  onOpenModal: () => void;
  onCloseBanner: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "bg-primary text-primary-foreground shadow-xl",
        "rounded-xl px-4 py-3 w-[260px]",
        "flex items-center justify-between cursor-pointer",
      )}
      onClick={onOpenModal}
    >
      <span className="font-medium">Give Feedback</span>

      <button
        className=""
        onClick={(e) => {
          e.stopPropagation();
          onCloseBanner();
        }}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
