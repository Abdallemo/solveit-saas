import WorkspacePageComp from "@/features/tasks/components/WorkspacePageComp";
import { isAuthorized } from "@/features/auth/server/actions";
export default async function Page({
  params,
}: {
  params: { workspaceId: string };
}) {
  await isAuthorized("SOLVER");

  return <WorkspacePageComp />;
}
