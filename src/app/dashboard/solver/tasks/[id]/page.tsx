import AuthGate from "@/components/AuthGate";
import { getServerUserSession } from "@/features/auth/server/actions";
import { FilesTable } from "@/features/media/components/FilesTable";
import { AssignTaskButton } from "@/features/tasks/components/AssignTaskButton";
import TaskPreview from "@/features/tasks/components/richTextEdito/TaskPreview";
import { getTaskFilesById, getTasksbyId } from "@/features/tasks/server/action";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
const isValidUuid = (uuid: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  );
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.id )
    return <AuthGate/>

  if (!isValidUuid(id)) {
    console.error(`Invalid ID format: ${id}. Redirecting.`);
    redirect("/dashboard/");
  }

  const task = await getTasksbyId(id);
  if (!task) redirect("/dashboard/");
  
  const files = await getTaskFilesById(id);

  if (!task?.content || !task.id) redirect("/dashboard/");
 
  return (
    <main className="flex flex-col w-full h-full gap-5 items-center p-10">
      <div className="w-full flex flex-col items-end gap-3">
        {currentUser.role === "SOLVER" && task.solverId !== currentUser.id && !task.solver && (
          <AssignTaskButton taskId={id} userId={currentUser.id} />
        )}
        <Suspense fallback={<Loader2 className="animate-spin w-2" />}>
          <TaskPreview content={task?.content} />
        </Suspense>
      </div>
      <div className="w-full flex flex-col items-center">
        <FilesTable files={files} scope={task} scopeType="task"/>
      </div>
    </main>
  );
}
