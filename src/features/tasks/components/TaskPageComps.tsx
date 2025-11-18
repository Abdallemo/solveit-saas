"use client";
import { FilesTable } from "@/features/media/components/FilesTable";
import { TaskNotFoundError } from "@/lib/Errors";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { PosterTaskReturn } from "../server/task-types";
import PostingEditor from "./richTextEdito/BlogTiptap";

export default function TaskPageComps({
  task,
}: {
  task: PosterTaskReturn | null;
}) {
  if (!task) throw new TaskNotFoundError();
  return (
    <main className="flex flex-col w-full h-full gap-5 items-center p-10 ">
      <div className="w-full flex flex-col items-end ">
        <Suspense fallback={<Loader2 className="animate-spin w-2" />}>
          <PostingEditor
            content={task?.content}
            editorOptions={{ editable: false }}
            showMenuBar={false}
          />
        </Suspense>
      </div>
      <div className="w-full flex flex-col items-center">
        <FilesTable files={task.taskFiles} scope={task} scopeType="task" />
      </div>
    </main>
  );
}
