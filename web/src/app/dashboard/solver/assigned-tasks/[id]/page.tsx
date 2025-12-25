import { isAuthorized } from "@/features/auth/server/actions";
import SolverTaskPageComps from "@/features/tasks/components/solver/SolverTaskPageComps";
import { getTasksbyIdWithFiles } from "@/features/tasks/server/data";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session } = await isAuthorized(["SOLVER"]);

  const task = await getTasksbyIdWithFiles(id, "SOLVER");
  const isBlocked = task ? (task.blockedSolvers ? true : false) : false;

  return (
    <SolverTaskPageComps
      currentUser={session.user}
      task={task}
      isBlocked={isBlocked}
    />
  );
}
