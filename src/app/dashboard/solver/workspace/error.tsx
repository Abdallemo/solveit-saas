"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Workspace error:", error);
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center  text-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-semibold">
        This workspace ID doesn't exist.
      </h2>
      <p className="text-muted-foreground">
        The workspace you're trying to access may have been deleted or never
        existed.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
