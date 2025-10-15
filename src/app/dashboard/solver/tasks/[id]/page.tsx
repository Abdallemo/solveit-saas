import { AuthGate } from "@/components/GateComponents";
import { getServerUserSession } from "@/features/auth/server/actions";
import TaskPageComps from "@/features/tasks/components/TaskPageComps";
import { getTasksbyIdWithFiles } from "@/features/tasks/server/data";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.id) return <AuthGate />;

  const task = await getTasksbyIdWithFiles(id);

  return <TaskPageComps currentUser={currentUser} task={task} />;
}
