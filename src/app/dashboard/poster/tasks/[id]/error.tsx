"use client";

import { Button } from "@/components/ui/button";
import { DisputeNotFoundError, TaskNotFoundError } from "@/lib/Errors";
import { AlertCircle } from "lucide-react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  console.log(error.name);
  if (error.name === TaskNotFoundError.name) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />

        <h2 className="text-xl font-semibold">
          {(error as DisputeNotFoundError).data.headline}
        </h2>
        <p className="text-muted-foreground">
          {(error as DisputeNotFoundError).data.message}
        </p>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center text-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />

      <h2 className="text-xl font-semibold">{error.message}</h2>

      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
