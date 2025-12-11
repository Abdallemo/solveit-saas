"use client";
import { env } from "@/env/client";
import { publicUserType } from "@/features/users/server/user-types";
import { useWebSocket } from "@/hooks/useWebSocketClass";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";


export type commentType = {
  id: string;
  content: string;
  createdAt: Date | null;
  userId: string;
  taskId: string;
  owner: publicUserType;
};

type CommentContextType = {
  comments: commentType[];
  setComments: Dispatch<SetStateAction<commentType[]>>;
  send: (data: commentType) => void;
};

const CommentContext = createContext<CommentContextType | undefined>(undefined);

type CommentProviderProps = {
  children: ReactNode;
  taskComments: commentType[];
  userId: string;
  taskId:string
};

export const CommentProvider = ({
  children,
  taskComments,
  userId,
  taskId
}: CommentProviderProps) => {
  const [comments, setComments] = useState<commentType[]>(
    [...(taskComments ?? [])].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    })
  );

  const { send } = useWebSocket<commentType>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/comments?task_id=${taskId}`,
    {
      onMessage: (comment) => {
        if (comment.userId !== userId) {
          setComments((prev) => [...prev, comment]);
        }
      },
    }
  );

  return (
    <CommentContext.Provider
      value={{
        comments,
        setComments,
        send,
      }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentContext);
  if (!context)
    throw new Error("useComments must be used within a CommentProvider");
  return context;
};
