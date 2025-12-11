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
  const { session } = await isAuthorized(["SOLVER"]);
  const { sessionId } = await params;

  return (
    <MentorshipSessionProvider sessionId={sessionId} userId={session?.user.id}>
      {children}
    </MentorshipSessionProvider>
  );
}
