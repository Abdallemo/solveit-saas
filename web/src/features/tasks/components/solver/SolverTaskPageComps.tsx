"use client";
import { FilesTable } from "@/features/media/components/FilesTable";
import { AssignTaskButton } from "@/features/tasks/components/AssignTaskButton";
import { SolverTaskReturn } from "@/features/tasks/server/task-types";
import { User } from "@/features/users/server/user-types";
import { TaskNotFoundError } from "@/lib/Errors";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
//import PostingEditor from "../richTextEdito/BlogTiptap";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
const PostingEditor = dynamic(
  () => import("@/features/tasks/components/richTextEdito/MainTiptapEditor"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-172.5 md:h-175 lg:h-195" />,
  },
);
export default function SolverTaskPageComps({
  task,
  currentUser,
  isBlocked,
}: {
  task: SolverTaskReturn | null;
  currentUser: User;
  isBlocked: boolean;
}) {
  if (!task) throw new TaskNotFoundError();
  return (
    <main className="flex flex-col w-full h-full gap-5 items-center p-10">
      <div className="w-full flex flex-col items-end gap-4">
        {!isBlocked && task.status === "OPEN" && (
          <AssignTaskButton taskId={task.id} userId={currentUser.id!} />
        )}
      </div>
      <div className="w-full flex flex-col gap-4">
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
