"use client";
import { MentorSession } from "@/features/mentore/server/types";
import { SessionNotFoundError } from "@/lib/Errors";
import {
  createContext,
  ReactNode,
  useContext,
  useState
} from "react";
type PartialMentorSession = Partial<MentorSession>;
type MentorshipSessionContextType = {
  mentorshipSession: MentorSession;
  updateSession: (updates: PartialMentorSession) => void;
};

const MentorshipSessionContext = createContext<
  MentorshipSessionContextType | undefined
>(undefined);
type MentorshipSessionPorviderProps = {
  children: ReactNode;
  mentorshipSession: MentorSession;
};
export const MentorshipSessionProvider = ({
  children,
  mentorshipSession,
}: MentorshipSessionPorviderProps) => {
  const [session, setSession] = useState(mentorshipSession);
  if (!session) throw new SessionNotFoundError();
  const updateSession = (updates: PartialMentorSession) => {
    setSession((prev) => ({ ...prev!, ...updates }));
  };
  return (
    <MentorshipSessionContext.Provider
      value={{
        mentorshipSession: session,
        updateSession,
      }}>
      {children}
    </MentorshipSessionContext.Provider>
  );
};

export const useMentorshipSession = () => {
  const context = useContext(MentorshipSessionContext);
  if (!context)
    throw new Error("useMentorship must be used within a MentorshipPorvider");
  return context;
};
