import { isAuthorized } from "@/features/auth/server/actions";
import DisputePageComps from "@/features/tasks/components/refund/refund-details-page";
import { getModeratorDisputes } from "@/features/tasks/server/data";

export default async function Page({
  params,
}: {
  params: Promise<{ disputeId: string }>;
}) {
  const { user } = await isAuthorized(["MODERATOR"]);
  const { disputeId } = await params;
  const dispute = await getModeratorDisputes(disputeId);
  return (
    <main className="w-full h-full">
      <DisputePageComps dispute={dispute}  />
    </main>
  );
}
