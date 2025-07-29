import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { isAuthorized } from "@/features/auth/server/actions";
import { getWorkspaceById } from "@/features/tasks/server/action";
import { ReactNode } from 'react'

export default async function WorkspaceLayout({
  children,
   params,
}: {
  children: ReactNode,
  params: Promise<{ workspaceId: string }>;
}) {
   await isAuthorized("SOLVER");
    const { workspaceId } = await params;
    const currentWorkspace = await getWorkspaceById(workspaceId);
  return (
    
     <WorkspaceProvider workspace={currentWorkspace}>
    {children}
    </WorkspaceProvider>
  )
}
