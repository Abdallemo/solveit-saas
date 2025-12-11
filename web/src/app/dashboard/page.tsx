import { UserRoleType } from "@/drizzle/schemas";
import { isAuthorized } from "@/features/auth/server/actions";
import { redirect } from "next/navigation";
export default async function Page() {
  const { user } = await isAuthorized([
    "SOLVER",
    "ADMIN",
    "MODERATOR",
    "POSTER",
  ]);

  const roleRedirectMap: Record<UserRoleType, string> = {
    POSTER: "/dashboard/poster",
    SOLVER: "/dashboard/solver",
    MODERATOR: "/dashboard/moderator",
    ADMIN: "/dashboard/admin",
  };

  if (roleRedirectMap[user.role]) {
    redirect(roleRedirectMap[user.role]);
  }
  return null;
}
