import { TaskProvider } from "@/contexts/TaskContext";
import { getServerUserSession } from "@/features/auth/server/actions";
import NewTaskpage from "@/features/tasks/components/NewTaskPage";
import { getDraftTask } from "@/features/tasks/server/action";

export default async function Page() {
  const currentUser = await getServerUserSession()
  if (!currentUser|| !currentUser.id) return

   const newTaskContent = await getDraftTask(currentUser.id);
  return (
    <TaskProvider dbContent={newTaskContent ?? ""}>
      <NewTaskpage />
    </TaskProvider>
  );
}
