"use client";
import TaskPostingEditor from "@/features/tasks/components/richTextEdito/Tiptap";
import {  Suspense } from "react";
import { toast } from "sonner";
import Loading from "@/app/loading";
import FileUploadUi from "@/features/media/components/FileUpload";
import { useTask } from "@/contexts/TaskContext";

export default function NewTaskpage() {
  const { content, setSelectedFiles} = useTask();


  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files)
    console.log(
      "Selected files:",
      files.map((f) => f.name),
    )
  }

  const handleSave = () => {
    console.log("Content to save:", content);
    toast.success(`Saved ${content}`);
    const imageUrls = Array.from(
      content.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)
    ).map(([, src]) => src);

    console.log("Extracted image URLs:", imageUrls);
    imageUrls.forEach(imgeUrl => {
      toast.success(`Saved ${imgeUrl} `);
      console.log(imgeUrl)
    });
  };

  return (
    <div className="flex flex-col h-full w-full items-center gap-3">
      <div className="max-w-5xl mx-auto mt-8 px-6">
        <h2 className="text-2xl font-semibold">Post a Task</h2>
        <p className="text-muted-foreground text-sm ">
          Describe the task clearly so students can understand and solve it
          effectively.
        </p>
      </div>

      <div className="max-w-6xl  px-6 flex-1  flex flex-col items-center gap-6 mb-8">
        <Suspense fallback={<Loading />}>
          <TaskPostingEditor />
        </Suspense>
      <FileUploadUi onFilesChange={handleFilesChange}/>
      </div>

    </div>
  );
}
