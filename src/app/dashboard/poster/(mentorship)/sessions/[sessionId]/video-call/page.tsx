import { isAuthorized } from "@/features/auth/server/actions";
import { VideoCallClientWraper } from "@/features/mentore/components/workspace/VideoCallClient";
import { VideoCallPageComps } from "@/features/mentore/components/workspace/VideoCallpageComps";

export default async function page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { user } = await isAuthorized(["POSTER"]);
  const { sessionId } = await params;
  console.log(sessionId);
  return (
    <VideoCallClientWraper>
      <VideoCallPageComps userId={user.id} sessionId={sessionId} />
    </VideoCallClientWraper>
  );
}
