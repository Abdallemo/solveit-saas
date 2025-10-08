"use client";

import Gates from "@/components/GateComponents";
import { useMentorshipSession } from "@/contexts/MentorSessionContext";
import { sessionUtilsV2 } from "@/lib/utils";

export function VideoCallClientWraper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mentorshipSession } = useMentorshipSession();
  const isPostSession = sessionUtilsV2.isAfterSession(
    { sessionEnd: mentorshipSession?.sessionEnd! },
    new Date()
  );
  
  if (isPostSession) {
    return <Gates.PostSession sessionId={mentorshipSession?.id!} />;
  }
  return <div className="w-full h-full">{children}</div>;
}
