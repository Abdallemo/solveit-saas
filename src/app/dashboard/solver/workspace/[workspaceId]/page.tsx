import WorkspacePageComp from "@/features/tasks/components/WorkspacePageComp";
import { isAuthorized } from "@/features/auth/server/actions";
import {  getWorkspaceById, handleTaskDeadline} from "@/features/tasks/server/action";

export default async function Page({params}:{params: Promise<{ workspaceId: string }>;}) {
  await isAuthorized("SOLVER");
  const { workspaceId } = await params;
  const currentWorkspace = await getWorkspaceById(workspaceId);
  await handleTaskDeadline(currentWorkspace)
  return <WorkspacePageComp />;
}

