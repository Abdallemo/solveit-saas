import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import { ReactNode } from "react";
import { getUserById } from "@/features/users/server/actions";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: ReactNode }) {
  const { user } = await isAuthorized(["SOLVER"]);

  if (!user || !user.id) {
    return redirect("/api/auth/signout?callbackUrl=/login");
  }

  const userInDb = await getUserById(user.id);
  if (!userInDb) {
    return redirect(
      "/api/auth/signout?callbackUrl=/login?error=account_deleted"
    );
  }

  return <>{children}</>;
}
