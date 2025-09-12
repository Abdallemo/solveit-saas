"use client";

import { Button } from "@/components/ui/button";
import {
  assignTaskToSolverById,
} from "@/features/tasks/server/action";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AssignTaskButton({
  taskId,
  userId,
}: {
  taskId: string;
  userId: string;
}) {
  const router= useRouter()
  const {mutateAsync:AssignTaskMutation,isPending} = useMutation({
    mutationFn:assignTaskToSolverById,
    onSuccess:(data)=>{toast.success(data.success,{id:"assign-task"})},
    onError:(err)=>{toast.error(err.message,{id:"assign-task"})}
  })
  async function handleClick()  {
    toast.loading("Assigning..",{id:"assign-task"})
   await AssignTaskMutation({solverId:userId,taskId})
   router.push("/dashboard/solver/assignedTasks")
  };

  return (
    <Button
      onClick={handleClick}
      variant="success"
      disabled={isPending}
      className="hover:cursor-pointer flex items-center justify-center gap-2 w-[200px]">
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
