import { DetectionComps } from "@/features/auth/components/deactivated-comps";
import { getServerUserSession } from "@/features/auth/server/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getServerUserSession();
  const { id } = await params;
  console.log(id);
  return <DetectionComps />;
}
