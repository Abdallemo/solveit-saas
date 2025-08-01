"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type TaskContextType = {
  content: string;
  setContent: (c: string) => void;
  setTitle: (c: string) => void;
  setDescription: (c: string) => void;
  setDeadline: (d: string) => void;
  setVisibility: (d: "public" | "private") => void;
  setSelectedFiles: (f: File[]) => void;
  setCategory: (f: string) => void;
  setPrice: (f: number) => void;
  selectedFiles: File[];
  deadline: string;
  visibility: "public" | "private";
  title: string;
  description: string;
  category: string;
  price: number;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);
type TaskPorvideProps = {
  children: ReactNode;
  dbCategory: string;
  dbTitle: string;
  dbDescription: string;
  dbContent: string;
  dbDeadline: string;
  updatedAt?: Date;
  dbVisibility: "public" | "private";
  dbPrice: number;
};
export const TaskProvider = ({
  children,
  dbContent,
  dbCategory,
  dbDeadline,
  dbVisibility,
  dbPrice,
  dbTitle,
  dbDescription,
  updatedAt,
}: TaskPorvideProps) => {
  const [content, setContent] = useState(dbContent);
  const [title, setTitle] = useState(dbTitle);
  const [description, setDescription] = useState(dbDescription);
  const [deadline, setDeadline] = useState(dbDeadline);
  const [visibility, setVisibility] = useState(dbVisibility);
  const [category, setCategory] = useState(dbCategory);
  const [price, setPrice] = useState(dbPrice);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  return (
    <TaskContext.Provider
      value={{
        content,
        setContent,
        selectedFiles,
        setSelectedFiles,
        deadline,
        setDeadline,
        visibility,
        setVisibility,
        category,
        setCategory,
        price,
        setPrice,
        description,
         setDescription,
        title,
        setTitle,
      }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used within a TaskProvider");
  return context;
};
