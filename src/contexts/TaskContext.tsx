"use client";
import { NewtaskDraftType } from "@/features/tasks/server/task-types";
import { createContext, useContext, useState, ReactNode } from "react";

type Draft = Partial<NewtaskDraftType>;
const initialType = {
  content: "",
  category: "",
  deadline: "12h",
  visibility: "public",
  price: 10,
  title: "",
  description: "",
};
type TaskContextType = {
  setSelectedFiles: (f: File[]) => void;
  selectedFiles: File[];
  draft: NewtaskDraftType;
  updateDraft: (d: Draft) => void;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [draft, setDraft] = useState(initialDraft ?? initialType);
  const updateDraft = (updates: Draft) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  return (
    <NewTaskContext.Provider
      value={{
        setSelectedFiles,
        draft,
        selectedFiles,
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
