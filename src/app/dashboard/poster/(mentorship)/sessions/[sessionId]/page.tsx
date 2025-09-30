import MentorshipWorkspace from "@/features/mentore/components/workspace/MentorshipWorkspace";
import { getMentorSession } from "@/features/mentore/server/action";

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getMentorSession(sessionId)
  // if (!session)return
  
  return <MentorshipWorkspace mentorWorkspace={session}/>;
}
