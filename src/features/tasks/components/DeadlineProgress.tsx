"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { deadlineProgressTrackerQuery } from "../client/queries";

export function DeadlineProgress() {
  const { currentWorkspace } = useWorkspace();
  const { data, isLoading, refetch } = useQuery(
    deadlineProgressTrackerQuery({
      solverId: currentWorkspace?.solverId,
      taskId: currentWorkspace?.taskId,
      worksapceId: currentWorkspace?.id,
    }),
  );

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
