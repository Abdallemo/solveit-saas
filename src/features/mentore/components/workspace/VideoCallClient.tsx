"use client";

import { PostSessionGate } from "@/components/GateComponents";
import { useMentorshipSession } from "@/contexts/MentorSessionContext";
import { sessionTimeUtils } from "@/lib/utils/utils";

export function VideoCallClientWraper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mentorshipSession } = useMentorshipSession();
  const isPostSession = sessionTimeUtils.isAfterSession(
    { sessionEnd: mentorshipSession?.sessionEnd! },
    new Date()
  );
  
  if (isPostSession) {
    return <PostSessionGate sessionId={mentorshipSession?.id!} />;
  }
  return <div className="w-full h-full">{children}</div>;
}
