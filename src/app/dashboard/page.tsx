import { getServerSession } from "@/features/auth/server/actions";
import { redirect } from "next/navigation";
import { UserRole } from "../../../types/next-auth";
export default async function Page() {
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
