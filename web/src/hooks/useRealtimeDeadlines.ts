// Client-side hook using date-fns
import { upcomingTasks } from "@/features/tasks/server/data";
import { formatDistanceToNow, isPast } from "date-fns";
import { useEffect, useState } from "react";

type RealtimeTaskState = Omit<upcomingTasks, "deadlineDate"> & {
  deadlineDate: Date;
  due: string;
};

const calculateDue = (task: RealtimeTaskState) => {
  if (isPast(task.deadlineDate)) {
    return "Passed";
  }

  return formatDistanceToNow(task.deadlineDate, {
    addSuffix: true,
  });
};

export default function useRealtimeDeadlines(
  initialDeadlines: upcomingTasks[],
) {
  const initialClientState: RealtimeTaskState[] = initialDeadlines.map(
    (task) => {
      const deadlineDate =
        task.deadlineDate instanceof Date
          ? task.deadlineDate
          : new Date(task.deadlineDate);

      const due = calculateDue({ ...task, deadlineDate } as RealtimeTaskState);
      return { ...task, deadlineDate, due };
    },
  );
  const [deadlineState, setDeadlineState] = useState(initialClientState);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      setDeadlineState((prev) =>
        prev.map((task) => {
          const newDue = calculateDue(task);

          if (newDue === task.due) {
            return task;
          }

          return { ...task, due: newDue };
        }),
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return deadlineState;
}
