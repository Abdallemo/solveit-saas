import { UserRoleType } from "@/drizzle/schemas";
import { getServerSession } from "@/features/auth/server/actions";
import { redirect } from "next/navigation";
export default async function Page() {
  const session = await getServerSession();
  const useRole = session?.user.role as UserRoleType;

  const roleRedirectMap: Record<UserRoleType, string> = {
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
