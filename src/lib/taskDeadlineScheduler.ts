
import { handleTaskDeadline ,getAllTasks} from "@/features/tasks/server/action";
import { logger } from "./logging/winston";

const INTERVAL = 10 * 60 * 1000; 

export function startDeadlineScheduler() {
  setInterval(async () => {
    try {
      const tasks = await getAllTasks(); 

      for (const task of tasks) {
       await handleTaskDeadline(task)
      }

      logger.info("[DeadlineScheduler] Checked all tasks.");
    } catch (error) {
      logger.error("DeadlineScheduler error:", {error:error});
    }
  }, INTERVAL);
}
