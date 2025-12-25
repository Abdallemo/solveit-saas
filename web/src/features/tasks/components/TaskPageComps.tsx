"use client";
import { FilesTable } from "@/features/media/components/FilesTable";
import { TaskNotFoundError } from "@/lib/Errors";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { getTasksbyIdWithFiles } from "../server/data";
import TaskLoading from "@/app/dashboard/solver/tasks/[id]/loading";

const PostingEditor = dynamic(
  () => import("@/features/tasks/components/richTextEdito/MainTiptapEditor"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-172.5 md:h-175 lg:h-195" />,
  },
);

export default function TaskPageComps({ id }: { id: string }) {
  const { data: task, isPending } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => await getTasksbyIdWithFiles(id, "POSTER"),
  });
  if (isPending) return <TaskLoading />;

  if (!task) throw new TaskNotFoundError();
  return (
    <main className="grid grid-cols-1 w-full h-full gap-5 items-center p-10 ">
      <div className="w-full flex flex-col ">
        <Suspense fallback={<Loader2 className="animate-spin w-2" />}>
          <PostingEditor
            content={task?.content}
            editorOptions={{ editable: false }}
            showMenuBar={false}
          />
        </Suspense>
      </div>
      <div className="w-full flex flex-col items-center pb-5">
        <FilesTable files={task.taskFiles} scope={task} scopeType="task" />
      </div>
    </main>
  );
}
