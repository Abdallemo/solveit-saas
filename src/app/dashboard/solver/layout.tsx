import { getServerUserSession, isAuthorized } from "@/features/auth/server/actions";
import { ReactNode } from "react";
import { getUserById } from "@/features/users/server/actions";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: ReactNode }) {
    const currentUser = await getServerUserSession();
  
    if (!currentUser) {
      return redirect("/api/auth/signout?callbackUrl=/login");
    }
  
    const userInDb = await getUserById(currentUser.id!);
    if (!userInDb) {
      return redirect(
        "/api/auth/signout?callbackUrl=/login?error=account_deleted"
      );
    }
  
  
  await isAuthorized(["SOLVER"]);

  return <>{children}</>;
}
