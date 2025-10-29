"use client";
import { env } from "@/env/client";
import { WorkspaceUploadedFileMeta } from "@/features/media/server/media-types";
import { WorkpaceSchemReturnedType } from "@/features/tasks/server/task-types";
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

type WorkspaceContextType = {
  serverTime: string;
  content: string;
  setContent: (c: string) => void;
  setCurrentWorkspace: React.Dispatch<
    React.SetStateAction<WorkpaceSchemReturnedType>
  >;
  currentWorkspace: WorkpaceSchemReturnedType;
  uploadedFiles: WorkspaceUploadedFileMeta[];
  setUploadedFiles: React.Dispatch<
    React.SetStateAction<WorkspaceUploadedFileMeta[]>
  >;
  comments: commentType[];
  setComments: Dispatch<SetStateAction<commentType[]>>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);
type WorkspacePorviderProps = {
  children: ReactNode;
  workspace: WorkpaceSchemReturnedType;
  serverCurrentTime: string;
};

export const WorkspaceProvider = ({
  children,
  workspace,
  serverCurrentTime,
}: WorkspacePorviderProps) => {
  const [content, setContent] = useState(workspace?.content ?? "");
  const [serverTime] = useState(serverCurrentTime);
  const [uploadedFiles, setUploadedFiles] = useState<
    WorkspaceUploadedFileMeta[]
  >(workspace?.workspaceFiles ?? []);
  const [currentWorkspace, setCurrentWorkspace] = useState(workspace);
  const [comments, setComments] = useState<commentType[]>(
    [...(workspace?.task.taskComments ?? [])].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    })
  );

  useWebSocket<commentType>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/comments?task_id=${currentWorkspace?.taskId}`,
    {
      onMessage: (comment) => {
        setComments((prev) => [...prev, comment]);
      },
    }
  );
  return (
    <WorkspaceContext.Provider
      value={{
        serverTime,
        content,
        setContent,
        uploadedFiles,
        setUploadedFiles,
        currentWorkspace,
        setCurrentWorkspace,
        comments,
        setComments,
      }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error("useWorkspace must be used within a WorkspacePorvider");
  return context;
};
