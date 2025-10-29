"use client";
import { env } from "@/env/client";
import { userSessionType } from "@/features/users/server/user-types";
import { useWebSocket } from "@/hooks/useWebSocketClass";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type NotificationContextType = {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  messages: Message[];
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);
type NotificationPorviderProps = {
  children: ReactNode;
  initailAllNotifications: Message[];
  user: userSessionType;
};

export type Message = {
  id: string;
  createdAt: Date | null;
  content: string;
  senderId: string;
  receiverId: string;
  subject: string | null;
  method: "SYSTEM" | "EMAIL";
  read: boolean;
};
export const NotificationProvider = ({
  children,
  initailAllNotifications,
  user,
}: NotificationPorviderProps) => {
  const [messages, setMessages] = useState<Message[]>(
    (initailAllNotifications ?? []).slice(0, 3)
  );

  useWebSocket<Message>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/notification?user_id=${user.id}`,
    {
      onMessage: (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) {
            return prev;
          }
          return [msg, ...prev].slice(0, 3);
        });
      },
    }
  );

  return (
    <NotificationContext.Provider
      value={{
        messages,
        setMessages,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useMentorship must be used within a MentorshipPorvider");
  return context;
};
