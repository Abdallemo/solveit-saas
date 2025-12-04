import { isAuthorized } from "@/features/auth/server/actions";
import { VideoCallClientWraper } from "@/features/mentore/components/workspace/VideoCallClient";
import { VideoCallPageComps } from "@/features/mentore/components/workspace/VideoCallpageComps";

export default async function page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { session } = await isAuthorized(["POSTER"]);
  const { sessionId } = await params;

  return (
    <VideoCallClientWraper>
      <VideoCallPageComps userId={session?.user.id} sessionId={sessionId} />
    </VideoCallClientWraper>
  );
}
