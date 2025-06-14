import { FilesTable } from "@/features/media/components/FilesTable";
import TaskPreview from "@/features/tasks/components/richTextEdito/TaskPreview";
import { getTaskFilesById, getTasksbyId } from "@/features/tasks/server/action";
import { File, Loader2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
const isValidUuid = (uuid: string) => {
  // A common regex for UUID v4
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid
  );
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isValidUuid(id)) {
    console.error(`Invalid ID format: ${id}. Redirecting.`);
    redirect("/dashboard/poster/yourTasks/");
  }

  const task = await getTasksbyId(id);
  if (!task) redirect("/dashboard/poster/yourTasks/");
  const files = await getTaskFilesById(id);

  if (!task?.content || !task.id) redirect("/dashboard/poster/yourTasks/");

  return (
    <main className="flex flex-col w-full h-full gap-5 items-center">
      <div>
        <Suspense fallback={<Loader2 className="animate-spin w-2" />}>
          <TaskPreview content={task?.content} />
        </Suspense>
      </div>
      <div className="max-w-5xl w-5xl ">
        <FilesTable files={files} />
      </div>
    </main>
  );
}
