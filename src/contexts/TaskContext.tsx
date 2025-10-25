"use client";
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
  category: "",
  deadline: "12h",
  visibility: "public",
  price: 10,
  title: "",
  description: "",
  uploadedFiles: [],
  contentText: "",
};
type TaskContextType = {
  draft: NewtaskDraftType;
  updateDraft: (d: Draft) => void;
  contentText: string;
  setContentTextFormat: Dispatch<SetStateAction<string>>;
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
  const [contentText, setContentTextFormat] = useState("");

  const updateDraft = (updates: Draft) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  return (
    <NewTaskContext.Provider
      value={{
        draft,
        contentText,
        setContentTextFormat,
        updateDraft,
      }}>
      {children}
    </NewTaskContext.Provider>
  );
};

export const NewuseTask = () => {
  const context = useContext(NewTaskContext);
  if (!context) throw new Error("useTask must be used within a TaskProvider");
  return context;
};
