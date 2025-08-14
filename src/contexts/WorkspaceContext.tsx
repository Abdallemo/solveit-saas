"use client";
import { WorkspaceUploadedFileMeta } from "@/features/media/server/media-types";
import { WorkpaceSchemReturnedType } from "@/features/tasks/server/action";
import { createContext, useContext, useState, ReactNode } from "react";

type WorkspaceContextType = {
  content: string;
  setContent: (c: string) => void;
  setCurrentWorkspace:  React.Dispatch<React.SetStateAction<WorkpaceSchemReturnedType>>
  currentWorkspace:WorkpaceSchemReturnedType
  uploadedFiles: WorkspaceUploadedFileMeta[];
  setUploadedFiles:React.Dispatch<React.SetStateAction<WorkspaceUploadedFileMeta[]>>
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);
type WorkspacePorviderProps = {
  children: ReactNode;
   workspace:WorkpaceSchemReturnedType
};
export const WorkspaceProvider = ({
  children,
  workspace
}: WorkspacePorviderProps) => {
  const [content, setContent] = useState(workspace?.content ?? "");
  const [uploadedFiles, setUploadedFiles] = useState<WorkspaceUploadedFileMeta[]>(workspace?.workspaceFiles ?? []);
  const [currentWorkspace,setCurrentWorkspace] = useState(workspace);
  
  return (
    <WorkspaceContext.Provider
      value={{
        content,
        setContent,
        uploadedFiles,
        setUploadedFiles,
        currentWorkspace,
        setCurrentWorkspace
      }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within a WorkspacePorvider");
  return context;
};
