import { isAuthorized } from "@/features/auth/server/actions";
import SolverTaskPageComps from "@/features/tasks/components/solver/SolverTaskPageComps";
import { getTasksbyIdWithFiles } from "@/features/tasks/server/data";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await isAuthorized(["SOLVER"]);

  return <SolverTaskPageComps currentUser={user} id={id} />;
}
