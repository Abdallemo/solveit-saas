"use client";
import Loading from "@/app/dashboard/poster/(mentorship)/sessions/[sessionId]/loading";
import { env } from "@/env/client";
import {
  getMentorSession,
  revalidateMentorSessinoData,
} from "@/features/mentore/server/action";
import {
  MentorChatSession,
  MentorSession,
} from "@/features/mentore/server/types";
import useCurrentUser from "@/hooks/useCurrentUser";
import useWebSocket from "@/hooks/useWebSocket";
import { SessionNotFoundError } from "@/lib/Errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
type PartialMentorSession = Partial<MentorSession>;
type MentorshipSessionContextType = {
  mentorshipSession: MentorSession;
  updateSession: (updates: PartialMentorSession) => void;
  uploadingFiles: File[];
  setUploadingFiles: Dispatch<SetStateAction<File[]>>;
};

const MentorshipSessionContext = createContext<
  MentorshipSessionContextType | undefined
>(undefined);
type MentorshipSessionPorviderProps = {
  children: ReactNode;
  sessionId: string;
};
export const MentorshipSessionProvider = ({
  children,
  sessionId,
}: MentorshipSessionPorviderProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: [sessionId, user?.id!],
    queryFn: async () => {
      return await getMentorSession(sessionId);
    },
    enabled: !!user?.id,
  });
  if (error) throw new SessionNotFoundError();

  useEffect(() => {
    if (!isLoading && !session) throw new SessionNotFoundError();
  }, [isLoading, session]);

  const updateSession = (updates: PartialMentorSession) => {
    queryClient.setQueryData<MentorSession>(
      [sessionId, user?.id!],
      (oldSession) => {
        if (!oldSession) return oldSession;
        return { ...oldSession, ...updates };
      }
    );
  };

  const mentorSessoin = useMutation({
    mutationFn: revalidateMentorSessinoData,
  });

  useWebSocket<MentorChatSession>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/mentorship?session_id=${sessionId}`,
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
        mentorSessoin.mutate({
          role: "solver",
          sessionId: msg.sessionId,
        });
        mentorSessoin.mutate({
          role: "poster",
          sessionId: msg.sessionId,
        });
      },
    }
  );
  if (isLoading || !session) return <Loading />;

  return (
    <MentorshipSessionContext.Provider
      value={{
        mentorshipSession: session,
        updateSession,
        uploadingFiles,
        setUploadingFiles,
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
