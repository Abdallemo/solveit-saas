"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { calculateTaskProgressV2 } from "../server/action";

export function DeadlineProgress() {
  const { currentWorkspace } = useWorkspace();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["progress", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.solverId || !currentWorkspace?.id) {
        return 0;
      }
      return await calculateTaskProgressV2(
        currentWorkspace.solverId,
        currentWorkspace.taskId
      );
    },
    refetchInterval: 10 * 1000,
    enabled: !!currentWorkspace?.solverId && !!currentWorkspace?.id,
  });

  if (isLoading || !data) {
    return { progress: 100, deadline: "N/A", isLoading };
  }

  return {
    progress: data.percentage ?? 100,
    deadline: data.deadline
      ? new Date(data.deadline).toLocaleString(undefined, {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A",
    isLoading,
  };
}
