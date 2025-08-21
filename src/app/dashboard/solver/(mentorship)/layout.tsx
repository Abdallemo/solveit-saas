import { MentorGate } from "@/components/AuthGate";
import { validateMentorAccess } from "@/features/mentore/server/action";
import { MentorError } from "@/lib/Errors";
import { ReactNode } from "react";

export default async function MentorLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await validateMentorAccess();
  } catch (error) {
    if (error instanceof MentorError) {
      return <MentorGate  />;
    }
  }
  return <>{children}</>;
}
