"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress"; // Adjust import as needed
import { parseDeadline } from "@/lib/utils";

interface DeadlineProgressProps {
  createdAt: Date;
  deadlineValue: string;
  progress:number
  setProgress: Dispatch<SetStateAction<number>>
}

export function DeadlineProgress({
  createdAt,
  deadlineValue,
  progress,
  setProgress
}: DeadlineProgressProps) {
  

  useEffect(() => {
    function calculateProgress() {
      const deadline = parseDeadline(deadlineValue, new Date(createdAt));
      if (!deadline) return;

      const now = new Date().getTime();
      const created = new Date(createdAt).getTime();
      const end = deadline.getTime();

      const totalDuration = end - created;
      const elapsed = now - created;

      const percentage = Math.min(
        Math.max((elapsed / totalDuration) * 100, 0),
        100
      );
      setProgress(percentage);
    }

    calculateProgress(); 
    const interval = setInterval(calculateProgress, 1000 * 60); 

    return () => clearInterval(interval);
  }, [createdAt, deadlineValue,setProgress]);

  return <Progress value={progress} className="h-2 w-full" />;
}
