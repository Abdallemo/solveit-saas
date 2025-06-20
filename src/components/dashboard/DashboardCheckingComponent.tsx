import { redirect } from "next/navigation";
import { UserRole } from "../../../types/next-auth";
import { getServerSession } from "@/features/auth/server/actions";

export default async function DashboardCheckingComponent() {
  const session = await getServerSession();
  const useRole = session?.user.role;

  const roleRedirectMap: Record<UserRole, string> = {
    POSTER: "/dashboard/poster",
    SOLVER: "/dashboard/solver",
    MODERATOR: "/dashboard/moderator",
    ADMIN: "/dashboard/admin",
  };

  if (useRole && roleRedirectMap[useRole]) {
    redirect(roleRedirectMap[useRole]);
  }

  return null;
}
