import { isAuthorized } from "@/features/auth/server/actions";
import WorkspaceOnboarding from "@/features/tasks/components/WorkspaceOnboardLoading";
import {
  createWorkspace,
  getTasksbyId,
  getWorkspaceByTaskId,
} from "@/features/tasks/server/action";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  await isAuthorized("SOLVER");

  const { taskId } = await params;
  const workspace = await getWorkspaceByTaskId(taskId);
  const Tasks = await getTasksbyId(taskId);

  console.log(Tasks?.solverId);
  if (!workspace) {
    const newWorkspace = await createWorkspace(Tasks);
    return (
      <>
        <WorkspaceOnboarding taskId={taskId} workspaceId={newWorkspace.id} />
      </>
    );
  }
  return redirect(`/dashboard/solver/workspace/${workspace.id}`);
}
