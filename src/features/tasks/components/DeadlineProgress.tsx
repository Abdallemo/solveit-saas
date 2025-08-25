"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { calculateTaskProgress } from "../server/action";

export function DeadlineProgress() {
  const { currentWorkspace } = useWorkspace();
  const { data: progress, isLoading, refetch } = useQuery({
    queryKey: ['progress', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.solverId || !currentWorkspace?.id) {
        return 0;
      }
      return await calculateTaskProgress(
        currentWorkspace.solverId,
        currentWorkspace.taskId
      );
    },
    refetchInterval: 10 * 1000, 
    enabled: !!currentWorkspace?.solverId && !!currentWorkspace?.id,
  });


  if (isLoading || progress === undefined) {
    return 0;
  }

  return progress;
}