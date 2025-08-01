"use client";

import { startTransition, useTransition } from "react";
import {
  assignTaskToSolverById,
  createWorkspace,
} from "@/features/tasks/server/action";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendNotification } from "@/features/notifications/server/action";
import { parseDeadline } from "@/lib/utils";

export function AssignTaskButton({
  taskId,
  userId,
}: {
  taskId: string;
  userId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const { error, success, newTask } = await assignTaskToSolverById(
          taskId,
          userId
        );

        if (success) {
          await createWorkspace(newTask);
          await sendNotification({
            sender: "solveit@org.com",
            receiver: newTask?.poster.email!,
            method: ["email"],
            body: {
              subject: "task Picked",
              content: `you Task is picked by ${
                newTask?.solver?.name
              }\n you will reciev your solution on ${parseDeadline(
                newTask?.deadline!
              )}`,
            },
          });
          toast.success(success);

        }
        if (error) {
          toast.error(error);
        }
      } catch (error: any) {
        toast.error(error?.message || "Something went wrong.");
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      variant="success"
      disabled={isPending}
      className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-[140px]">
      {isPending ? (
        <>
          <Loader2 className="animate-spin w-4 h-4" />
          Assigning Task...
        </>
      ) : (
        "Start Solving"
      )}
    </Button>
  );
}
