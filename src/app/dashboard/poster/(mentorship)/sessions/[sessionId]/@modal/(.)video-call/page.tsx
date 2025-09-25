import { isAuthorized } from "@/features/auth/server/actions";
import { VideoCallModal } from "@/features/mentore/components/workspace/VideoCallModal";
import { VideoCallPageComps } from "@/features/mentore/components/workspace/VideoCallpageComps";

export default async function page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { user } = await isAuthorized(["POSTER"]);
  const { sessionId } = await params;
  return (
    <VideoCallModal>
      <VideoCallPageComps userId={user.id} sessionId={sessionId} />
    </VideoCallModal>
  );
}
