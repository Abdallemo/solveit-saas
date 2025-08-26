import {
  isAuthorized,
} from "@/features/auth/server/actions";
import SolverDashboard from "@/features/users/components/solver/SolverDashboard";

export default async function page() {

  await isAuthorized(["SOLVER"]);

  return (
    <div className="w-full h-full">
      <SolverDashboard/>

    </div>
  );
}
