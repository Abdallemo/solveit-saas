import { DetectionComps } from "@/features/auth/components/deactivated-comps";
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
    redirect(`/dashboard/`);
  }

  return <DetectionComps />;
}
