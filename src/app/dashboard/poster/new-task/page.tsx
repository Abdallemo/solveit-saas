import { NewTaskProvider } from "@/contexts/TaskContext";
import {
  isAuthorized
} from "@/features/auth/server/actions";
import TaskCreationPage from "@/features/tasks/components/NewTaskPage";
import { getDraftTaskWithDefualtVal } from "@/features/tasks/server/data";
import { TaskSchema } from "@/features/tasks/server/task-types";
export default async function Page() {
  const { user: currentUser, session } = await isAuthorized(["POSTER"]);

  const draft = await getDraftTaskWithDefualtVal(currentUser.id);
  const defaultValues: TaskSchema = {
    title: draft?.title ?? "",
    description: draft?.description ?? "",
    content: draft?.content ?? "",
    contentText: draft?.contentText ?? "",
    deadline: draft?.deadline ?? "12h",
    visibility: draft?.visibility ?? "public",
    category: draft?.category ?? "",
    price: draft?.price ?? 10,
    uploadedFiles: draft?.uploadedFiles ?? [],
  };

  return (
    <NewTaskProvider initialDraft={draft!}>
      <TaskCreationPage defaultValues={defaultValues} />
    </NewTaskProvider>
  );
}
