import { isAuthorized } from "@/features/auth/server/actions";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  await isAuthorized(["MODERATOR"]);

  return <>{children}</>;
}
