import { TaskProvider } from "@/contexts/TaskContext";
import { getServerUserSession } from "@/features/auth/server/actions";
import TaskCreationPage from "@/features/tasks/components/NewTaskPage";
import { getDraftTask } from "@/features/tasks/server/action";
import { TaskSchema } from "@/features/tasks/server/task-types";

export default async function Page() {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.id) return;

  const draft = await getDraftTask(currentUser.id);

  const {
    content = "",
    category = "",
    deadline = "12h",
    visibility = "public",
    price = 10,
    title = "",
    description = "",
    updatedAt,
  } = draft ?? {};

  const defaultValues: TaskSchema = {
    title: title ?? "",
    description: description ?? "",
    content: content ?? "",
    deadline: deadline ?? "12h",
    visibility: visibility ?? "public",
    category: category ?? "",
    price: price ?? 10,
  };

  return (
    <TaskProvider
      dbContent={content!}
      dbCategory={category!}
      dbDeadline={deadline!}
      dbPrice={price!}
      dbVisibility={visibility!}
      dbDescription={description!}
      dbTitle={title}
      updatedAt={updatedAt}>
      <TaskCreationPage defaultValues={defaultValues} />
    </TaskProvider>
  );
}
