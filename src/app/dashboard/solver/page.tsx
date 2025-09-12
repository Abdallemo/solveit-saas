import { isAuthorized } from "@/features/auth/server/actions";
import { getSolverStats } from "@/features/tasks/server/action";
import SolverDashboard from "@/features/users/components/solver/SolverDashboard";

export default async function page() {
  await isAuthorized(["SOLVER"]);
  const data = await getSolverStats();
  return (
    <div className="w-full h-full">
      <SolverDashboard stats={data} />
    </div>
  );
}
