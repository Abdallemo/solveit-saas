import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "../../../types/next-auth";

export default async function page() {
  const session = await auth();
  const useRole = session?.user.role;
  if (!useRole) {
    return null;
  }
  const roleRedirectMap: Record<UserRole, string> = {
    POSTER: '/dashboard/poster',
    SOLVER: '/dashboard/solver',
    MODERATOR: '/dashboard/moderator',
    ADMIN: '/dashboard/admin'
  };
  
  if (useRole && roleRedirectMap[useRole]) {
    return redirect(roleRedirectMap[useRole]);
  }
  
  
}
