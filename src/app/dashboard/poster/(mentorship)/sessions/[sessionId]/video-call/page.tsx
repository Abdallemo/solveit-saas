import { isAuthorized } from "@/features/auth/server/actions";
import { VideoCallPageComps } from "@/features/mentore/components/workspace/VideoCallpageComps";

export default async function page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const {user} = await isAuthorized(["POSTER"])
  const { sessionId } = await params;
  console.log(sessionId)
  return (
    <div >
      <VideoCallPageComps userId={user.id} sessionId={sessionId} />
    </div>
  );
}
