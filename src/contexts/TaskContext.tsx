
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type TaskContextType = {
  content: string;
  setContent: (c: string) => void;
  selectedFiles: File[];
  setSelectedFiles: (f: File[]) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children ,dbContent}: { children: ReactNode ,dbContent:string}) => {
  const [content, setContent] = useState(dbContent);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  return (
    <TaskContext.Provider value={{ content, setContent, selectedFiles, setSelectedFiles }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used within a TaskProvider");
  return context;
};
