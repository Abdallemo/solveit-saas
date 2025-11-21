"use client";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { NewtaskDraftType } from "@/features/tasks/server/task-types";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type Draft = Partial<NewtaskDraftType>;
const initialType = {
  content: "",
  contentText: "",
  category: "",
  deadline: "12h",
  visibility: "public",
  price: 10,
  title: "",
  description: "",
  uploadedFiles: [],
};
type TaskContextType = {
  draft: NewtaskDraftType;
  updateDraft: (d: Draft) => void;
  filePreview: UploadedFileMeta | null;
  setFilePreview: Dispatch<SetStateAction<UploadedFileMeta | null>>;
};

const NewTaskContext = createContext<TaskContextType | undefined>(undefined);
type TaskPorvideProps = {
  children: ReactNode;
  initialDraft: NewtaskDraftType;
};
export const NewTaskProvider = ({
  children,
  initialDraft,
}: TaskPorvideProps) => {
  const [draft, setDraft] = useState(initialDraft ?? initialType);
  const [filePreview, setFilePreview] = useState<UploadedFileMeta | null>(null);

  const updateDraft = (updates: Draft) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  return (
    <NewTaskContext.Provider
      value={{ filePreview, setFilePreview, draft, updateDraft }}>
      {children}
    </NewTaskContext.Provider>
  );
};

export const NewuseTask = () => {
  const context = useContext(NewTaskContext);
  if (!context) throw new Error("useTask must be used within a TaskProvider");
  return context;
};
