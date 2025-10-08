import Gates from "@/components/GateComponents";
import { NewTaskProvider } from "@/contexts/TaskContext";
import { getServerUserSession } from "@/features/auth/server/actions";
import TaskCreationPage from "@/features/tasks/components/NewTaskPage";
import { getDraftTaskWithDefualtVal } from "@/features/tasks/server/data";
import { TaskSchema } from "@/features/tasks/server/task-types";
export default async function Page() {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.id) return <Gates.Auth />;

  const draft = await getDraftTaskWithDefualtVal(currentUser.id);
  const defaultValues: TaskSchema = {
    title: draft?.title ?? "",
    description: draft?.description ?? "",
    content: draft?.content ?? "",
    deadline: draft?.deadline ?? "12h",
    visibility: draft?.visibility ?? "public",
    category: draft?.category ?? "",
    price: draft?.price ?? 10,
  };

  // console.log("initial draft:\n", draft);
  return (
    <NewTaskProvider initialDraft={draft!}>
      <TaskCreationPage defaultValues={defaultValues} />
    </NewTaskProvider>
  );
}
