import { getServerSession } from "@/features/auth/server/actions";
import { redirect } from "next/navigation";

export async function GuestOnly({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (session) {
    redirect(`/dashboard/${session.user.role.toLocaleLowerCase()}`);
  }

  return <>{children}</>;
}
