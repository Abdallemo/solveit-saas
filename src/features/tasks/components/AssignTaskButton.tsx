"use client";

import {
  assignTaskToSolverById,

} from "@/features/tasks/server/action";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export function AssignTaskButton({
  taskId,
  userId,
}: {
  taskId: string;
  userId: string;
}) {

  const {mutateAsync:AssignTaskMutation,isPending} = useMutation({
    mutationFn:assignTaskToSolverById,
    onSuccess:(data)=>{toast.success(data.success,{id:"assign-task"})},
    onError:(err)=>{toast.error(err.message,{id:"assign-task"})}
  })
  async function handleClick()  {
    toast.loading("Assigning..",{id:"assign-task"})
   await AssignTaskMutation({solverId:userId,taskId})
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
