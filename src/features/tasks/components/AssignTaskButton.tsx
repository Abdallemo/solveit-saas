"use client";

import { startTransition, useTransition } from "react";
import { assignTaskToSolverById } from "@/features/tasks/server/action";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
        const { error, success } = await assignTaskToSolverById(taskId, userId);
        if (success) {
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
