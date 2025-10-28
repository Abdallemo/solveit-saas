import { MentorshipSessionProvider } from "@/contexts/MentorSessionContext";
import { isAuthorized } from "@/features/auth/server/actions";

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

  return (
    <MentorshipSessionProvider sessionId={sessionId} userId={user.id}>
      {children}
    </MentorshipSessionProvider>
  );
}
