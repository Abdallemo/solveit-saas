import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import {
  isAuthorized
} from "@/features/auth/server/actions";
import { getWorkspaceById } from "@/features/tasks/server/data";
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
  const serverCurrentTime = new Date().toISOString();

  return (
    <WorkspaceProvider
      workspace={currentWorkspace}
      serverCurrentTime={serverCurrentTime}>
      {children}
    </WorkspaceProvider>
  );
}
