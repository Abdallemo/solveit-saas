import { MentorshipSessionProvider } from "@/contexts/MentorSessionContext";
import { isAuthorized } from "@/features/auth/server/actions";
import { getMentorSession } from "@/features/mentore/server/action";

import { ReactNode } from "react";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ sessionId: string }>;
}) {
  const { user } = await isAuthorized(["POSTER"]);
  const { sessionId } = await params;
  const session = await getMentorSession(sessionId);

  return (
    <MentorshipSessionProvider mentorshipSession={session}>
      {children}
    </MentorshipSessionProvider>
  );
}
