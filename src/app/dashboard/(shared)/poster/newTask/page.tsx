import { TaskProvider } from "@/contexts/TaskContext";
import NewTaskpage from "@/features/tasks/components/NewTaskPage";

export default function Page() {
  return (
    <TaskProvider>
      <NewTaskpage />
    </TaskProvider>
  );
}
