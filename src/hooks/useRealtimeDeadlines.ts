import { upcomingTasks } from "@/features/tasks/server/data";
import { formatTimeRemaining } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function useRealtimeDeadlines(
  initialDeadlines: upcomingTasks[]
) {
  const [clientStartTime] = useState(Date.now());
  const [deadlineState, setDeadlineState] = useState(initialDeadlines);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDeadlineState((prev) =>
        prev.map((task) => {
          const elapsed = now - clientStartTime;

          const remaining = task.totalTime - (task.timePassed + elapsed);

          if (remaining <= 0) return { ...task, due: "Passed" };

          const due = formatTimeRemaining(
            new Date(now + remaining),
            new Date(now),
            task.unit
          );

          return { ...task, due };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [clientStartTime]);

  return deadlineState;
}
