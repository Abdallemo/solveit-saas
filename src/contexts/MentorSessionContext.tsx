"use client";
import { env } from "@/env/client";
import {
  MentorChatSession,
  MentorSession,
} from "@/features/mentore/server/types";
import useCurrentUser from "@/hooks/useCurrentUser";
import useWebSocket from "@/hooks/useWebSocket";
import { SessionNotFoundError } from "@/lib/Errors";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
type PartialMentorSession = Partial<MentorSession>;
type MentorshipSessionContextType = {
  mentorshipSession: MentorSession;
  updateSession: (updates: PartialMentorSession) => void;
  uploadingFiles: File[];
  setUploadingFiles: Dispatch<SetStateAction<File[]>>
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
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const { user } = useCurrentUser();

  if (!session) throw new SessionNotFoundError();
  const updateSession = (updates: PartialMentorSession) => {
    setSession((prev) => ({ ...prev!, ...updates }));
  };

  useWebSocket<MentorChatSession>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/mentorship?session_id=${session?.id}`,
    {
      onMessage: (msg) => {
        updateSession({
          chats: [
            ...(session?.chats || []),
            { ...msg, createdAt: new Date(msg.createdAt!), readAt: null },
          ],
        });
        if (msg.chatFiles?.length > 0 && msg.sentBy === user?.id) {
          setUploadingFiles([]);
        }
      },
    }
  );

  return (
    <MentorshipSessionContext.Provider
      value={{
        mentorshipSession: session,
        updateSession,
        uploadingFiles,
        setUploadingFiles
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
