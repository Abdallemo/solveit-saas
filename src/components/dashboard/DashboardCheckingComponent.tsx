import { getServerSession } from "@/features/auth/server/actions";
import { UserRole } from "@/features/users/server/user-types";
import { redirect } from "next/navigation";

export default async function DashboardCheckingComponent() {
  const session = await getServerSession();
  const useRole = session?.user.role as UserRole;

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
