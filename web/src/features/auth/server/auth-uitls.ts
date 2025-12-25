import { UserRole } from "@/features/users/server/user-types";

export function hasAccess(
  currentRole: UserRole | undefined | null,
  allowedRoles: UserRole[],
): boolean {
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}
