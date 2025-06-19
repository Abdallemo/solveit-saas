import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { isAuthorized } from "@/features/auth/server/actions";
import WorkspacePageComp from "@/features/tasks/components/WorkspacePageComp";
import { getWorkspaceById } from "@/features/tasks/server/action";
import React from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  await isAuthorized("SOLVER");
  const { workspaceId } = await params;
  const currentWorkspace = await getWorkspaceById(workspaceId);
  

  return (
    <>
      <WorkspaceProvider workspace={currentWorkspace}>
        {<WorkspacePageComp/>}
      </WorkspaceProvider>
    </>
  );
}
