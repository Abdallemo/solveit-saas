"use client";
import { MentorSession } from "@/features/mentore/server/types";
import { SessionNotFoundError } from "@/lib/Errors";
import { createContext, ReactNode, useContext, useState } from "react";

type MentorshipSessionContextType = {
  mentorshipSession: MentorSession;
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
  const [session] = useState(mentorshipSession);
   if (!session) throw new SessionNotFoundError();
  return (
    <MentorshipSessionContext.Provider
      value={{
        mentorshipSession: session,
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
