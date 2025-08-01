
import { handleTaskDeadlineEnhacned ,getAllTasks} from "@/features/tasks/server/action";

const INTERVAL = 10 * 60 * 1000; 

export function startDeadlineScheduler() {
  setInterval(async () => {
    try {
      const tasks = await getAllTasks(); 

      for (const task of tasks) {
       await handleTaskDeadlineEnhacned(task)
      }

      console.log("[DeadlineScheduler] Checked all tasks.");
    } catch (error) {
      console.error("DeadlineScheduler error:", error);
    }
  }, INTERVAL);
}
