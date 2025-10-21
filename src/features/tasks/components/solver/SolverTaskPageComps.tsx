"use client";
import { FilesTable } from "@/features/media/components/FilesTable";
import { AssignTaskButton } from "@/features/tasks/components/AssignTaskButton";
import TaskPreview from "@/features/tasks/components/richTextEdito/TaskPreview";
import { SolverTaskReturn } from "@/features/tasks/server/task-types";
import { userSessionType } from "@/features/users/server/user-types";
import { TaskNotFoundError } from "@/lib/Errors";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function SolverTaskPageComps({
  task,
  currentUser,
  isBlocked,
}: {
  task: SolverTaskReturn | null;
  currentUser: userSessionType;
  isBlocked: boolean;
}) {
  if (!task) throw new TaskNotFoundError();
  return (
    <main className="flex flex-col w-full h-full gap-5 items-center p-10">
      <div className="w-full flex flex-col items-end ">
        {!isBlocked && (
          <AssignTaskButton taskId={task.id} userId={currentUser.id!} />
        )}
        <Suspense fallback={<Loader2 className="animate-spin w-2" />}>
          <TaskPreview content={task?.content} />
        </Suspense>
      </div>
      <div className="w-full flex flex-col items-center">
        <FilesTable files={task.taskFiles} scope={task} scopeType="task" />
      </div>
    </main>
  );
}
