"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress"; // Adjust import as needed
import { calculateProgress, parseDeadline } from "@/lib/utils";

interface DeadlineProgressProps {
  createdAt: Date;
  deadlineValue: string;
  progress: number;
  setProgress: Dispatch<SetStateAction<number>>;
}

export function DeadlineProgress({
  createdAt,
  deadlineValue,
  progress,
  setProgress,
}: DeadlineProgressProps) {
  useEffect(() => {
    setProgress(calculateProgress(deadlineValue, createdAt));
    const interval = setInterval(
      () => setProgress(calculateProgress(deadlineValue, createdAt)),
      1000 * 60
    );

    return () => clearInterval(interval);
  }, [createdAt, deadlineValue, setProgress]);

  return <Progress value={progress} className="h-2 w-full" />;
}
