import { CommentProvider } from "@/contexts/TaskCommentProvider";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { isAuthorized } from "@/features/auth/server/actions";
import { handleTaskDeadline } from "@/features/tasks/server/action";
import { getWorkspaceById } from "@/features/tasks/server/data";
import { getCurrentServerTime } from "@/lib/utils/utils";
import { redirect } from "next/navigation";

import { ReactNode } from "react";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { user } = await isAuthorized(["SOLVER"]);
  const { workspaceId } = await params;
  const currentWorkspace = await getWorkspaceById(workspaceId, user?.id!);
  if (!currentWorkspace) {
    throw new Error("Workspace not found");
  }
  if (currentWorkspace.solverId !== user?.id) {
    redirect("/dashboard/");
  }
  await handleTaskDeadline(currentWorkspace);
  return (
    <CommentProvider
      taskComments={currentWorkspace.task.taskComments}
      taskId={currentWorkspace.taskId}
      userId={user.id}>
      <WorkspaceProvider
        workspace={currentWorkspace}
        serverCurrentTime={getCurrentServerTime().toISOString()}
        userId={user.id}>
        {children}
      </WorkspaceProvider>
    </CommentProvider>
  );
}
