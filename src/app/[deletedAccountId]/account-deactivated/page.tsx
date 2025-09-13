import { DetectionComps } from "@/features/auth/components/deactivated-comps";
import { getServerUserSession } from "@/features/auth/server/actions";
import { getUserById } from "@/features/users/server/actions";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ deletedAccountId: string }>;
}) {
  const { deletedAccountId } = await params;
  const user = await getUserById(deletedAccountId);
  if (!user) redirect("/");
  if (user.emailVerified) {
    const userSession = await getServerUserSession();
    if (userSession) {
      redirect(`/dashboard/${userSession?.role?.toLocaleLowerCase()}`);
    }
  }
  console.log(deletedAccountId);
  return <DetectionComps />;
}
