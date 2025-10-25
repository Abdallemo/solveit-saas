import { isAuthorized } from "@/features/auth/server/actions";
import {
  getSolverStats,
  getSolverUpcomminDeadlines,
} from "@/features/tasks/server/data";
import SolverDashboard from "@/features/users/components/solver/SolverDashboard";

export default async function page() {
  await isAuthorized(["SOLVER"]);
  const data = await getSolverStats();
  const deadlines = await getSolverUpcomminDeadlines();
  return (
    <div className="w-full h-full">
      <SolverDashboard stats={data} deadlines={deadlines} />
    </div>
  );
}
