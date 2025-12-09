"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FloatingFeedbackButtonProps {
  isForceOpen?: boolean; // if true → auto-open and cannot be hidden
  onClick: () => void;
  isOpen: boolean;
}

export function FloatingFeedbackButton({
  isForceOpen = false,
  onClick,
  isOpen,
}: FloatingFeedbackButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-xl"
      disabled={isForceOpen}
    >
      {isOpen ? (
        <ChevronDown className="h-6 w-6" />
      ) : (
        <ChevronUp className="h-6 w-6" />
      )}
    </Button>
  );
}
