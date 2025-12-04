import db from "@/drizzle/db";
import { TaskTable } from "@/drizzle/schemas";
import { isAuthorized } from "@/features/auth/server/actions";
import WorkspaceOnboarding from "@/features/tasks/components/WorkspaceOnboardLoading";
import { getWorkspaceByTaskId } from "@/features/tasks/server/data";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function page({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const {
    session: { user },
  } = await isAuthorized(["SOLVER"]);
  const { taskId } = await params;
  const workspace = await getWorkspaceByTaskId(taskId, user?.id!);

  if (!workspace) {
    throw new Error("unable to find this worksapce");
  }

  if (workspace?.task.status === "ASSIGNED") {
    await db
      .update(TaskTable)
      .set({ status: "IN_PROGRESS" })
      .where(eq(TaskTable.id, workspace?.taskId));
    return (
      <>
        <WorkspaceOnboarding taskId={taskId} workspaceId={workspace.id} />
      </>
    );
  }
  console.log(`before redirecting current worksapce ${workspace.id}`);
  return redirect(`/dashboard/solver/workspace/${workspace.id}`);
}
