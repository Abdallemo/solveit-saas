import Gates from "@/components/GateComponents";
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
      return <Gates.Mentor />;
    }
  }
  return <>{children}</>;
}
