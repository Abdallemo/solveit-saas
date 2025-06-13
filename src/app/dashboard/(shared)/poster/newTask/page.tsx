import { TaskProvider } from "@/contexts/TaskContext";
import { getServerUserSession } from "@/features/auth/server/actions";
import NewTaskpage from "@/features/tasks/components/NewTaskPage";
import { getDraftTask } from "@/features/tasks/server/action";
type DraftTask = {
  content: string;
  category: string;
  deadline: string;
  visibility: "public" | "private";
  price: number;
  updatedAt?: Date;
};

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
  } = draft ?? {};
  return (
    <TaskProvider
      dbContent={content ?? ""}
      dbCategory={category ?? ""}
      dbDeadline={deadline ?? "12h"}
      dbPrice={price ?? 10}
      dbVisibility={visibility ?? "public"}>
      <NewTaskpage />
    </TaskProvider>
  );
}
