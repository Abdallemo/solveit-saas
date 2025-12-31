"use client";
import {
  UploadedFileMeta,
  WorkspaceUploadedFileMeta,
} from "@/features/media/media-types";
import { WorkpaceSchemReturnedType } from "@/features/tasks/server/task-types";
import { publicUserType } from "@/features/users/server/user-types";
import { JSONContent } from "@tiptap/react";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { useComments } from "./TaskCommentProvider";
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
  content: JSONContent;
  setContent: (c: JSONContent) => void;
  contentText: string;
  setContentText: (c: string) => void;
  setCurrentWorkspace: React.Dispatch<
    React.SetStateAction<WorkpaceSchemReturnedType>
  >;
  filePreview: UploadedFileMeta | null;
  setFilePreview: Dispatch<SetStateAction<UploadedFileMeta | null>>;
  currentWorkspace: WorkpaceSchemReturnedType;
  uploadedFiles: WorkspaceUploadedFileMeta[];
  setUploadedFiles: React.Dispatch<
    React.SetStateAction<WorkspaceUploadedFileMeta[]>
  >;
  comments: commentType[];
  setComments: Dispatch<SetStateAction<commentType[]>>;
  send: (data: commentType) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);
type WorkspacePorviderProps = {
  children: ReactNode;
  workspace: WorkpaceSchemReturnedType;
  serverCurrentTime: string;
  userId: string;
};

export const WorkspaceProvider = ({
  children,
  workspace,
  serverCurrentTime,
  userId,
}: WorkspacePorviderProps) => {
  const [content, setContent] = useState(workspace?.content ?? {});
  const [contentText, setContentText] = useState(workspace?.contentText ?? "");
  const [filePreview, setFilePreview] = useState<UploadedFileMeta | null>(null);
  const [serverTime] = useState(serverCurrentTime);
  const [uploadedFiles, setUploadedFiles] = useState<
    WorkspaceUploadedFileMeta[]
  >(workspace?.workspaceFiles ?? []);
  const [currentWorkspace, setCurrentWorkspace] = useState(workspace);

  return (
    <WorkspaceContext.Provider
      value={{
        serverTime,
        content,
        contentText,
        setContentText,
        filePreview,
        setFilePreview,
        setContent,
        uploadedFiles,
        setUploadedFiles,
        currentWorkspace,
        setCurrentWorkspace,
        ...useComments(),
      }}
    >
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
