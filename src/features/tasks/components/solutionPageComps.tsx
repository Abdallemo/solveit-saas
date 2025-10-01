"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { env } from "@/env/client";
import { FilesTable } from "@/features/media/components/FilesTable";
import {
  taskRefundSchema,
  taskRefundSchemaType,
} from "@/features/tasks/server/task-types";
import useCurrentUser from "@/hooks/useCurrentUser";
import useWebSocket from "@/hooks/useWebSocket";
import { formatDateAndTimeNUTC } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  acceptSolution,
  createTaskComment,
  requestRefund,
} from "../server/action";
import { SolutionById } from "../server/task-types";
import { SolutionPreview } from "./richTextEdito/TaskPreview";
import { CommentCard, commentType } from "./richTextEdito/WorkspaceSidebar";
import GetStatusBadge from "./taskStatusBadge";

function AcceptSolutionDialog({ solution }: { solution: SolutionById }) {
  const router = useRouter();
  const { mutateAsync: acceptSolutionMuta, isPending } = useMutation({
    mutationFn: acceptSolution,
    onSuccess: () => {
      toast.success("You have successfully accepted this task to be Complete", {
        id: "accept-task",
      });
    },
    onError: () => {
      toast.error("something went wrong", { id: "accept-task" });
    },
  });
  async function handleAccept() {
    toast.loading("accepting..", { id: "accept-task" });
    await acceptSolutionMuta(solution);
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="flex items-center space-x-2" variant={"success"}>
          <CheckCircle className="h-4 w-4" />
          <span>Accept Solution</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Accept This Solution?</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            By accepting this solution, you confirm that it meets your
            requirements and resolves your task. This action will mark the task
            as completed and release payment to the solver.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className={`${isPending ? "cursor-not-allowed" : ""} `}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleAccept}
            className={`${
              isPending ? "cursor-not-allowed" : ""
            } bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 cursor-pointer`}>
            Yes, Accept Solution
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RequestRefundDialog({ solution }: { solution: SolutionById }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const form = useForm<taskRefundSchemaType>({
    resolver: zodResolver(taskRefundSchema),
    mode: "onChange",
    defaultValues: { reason: "" },
  });
  const {
    formState: { isValid },
    watch,
    control,
  } = form;
  const reason = watch("reason");

  const { mutateAsync: requestRefundMutate, isPending } = useMutation({
    mutationFn: requestRefund,
    onSuccess: () => {
      toast.success("Your refund Request Has bean submited", {
        id: "refund-request",
      });
    },
    onError: () => {
      toast.error("Something Went Wrong please Try again!", {
        id: "refund-request",
      });
    },
  });
  async function handleRefund(formData: taskRefundSchemaType) {
    toast.loading("Requesting..", { id: "refund-request" });
    await requestRefundMutate({ reason: formData.reason, solution });
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant="destructive"
            className="flex items-center space-x-2 ">
            <XCircle className="h-4 w-4" />
            <span>Request Refund</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <form onSubmit={form.handleSubmit(handleRefund)}>
            <AlertDialogHeader>
              <AlertDialogTitle>Request a Refund?</AlertDialogTitle>
              <AlertDialogDescription className="text-foreground">
                Are you sure you want to request a refund for this task? This
                indicates that the solution does not meet your requirements.
                Please note that refund requests will be reviewed by our team.
              </AlertDialogDescription>
              <FormField
                control={control}
                name="reason"
                render={({ field }) => (
                  <Textarea
                    value={reason}
                    rows={2}
                    placeholder="Reason of refund"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                )}
              />
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {isValid ? (
                <AlertDialogAction
                  type="submit"
                  className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 cursor-pointer">
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      sending Your Request Refund
                    </>
                  ) : (
                    "Yes, Request Refund"
                  )}
                </AlertDialogAction>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogAction asChild>
                      <Button
                        disabled={false}
                        className="opacity-45 cursor-not-allowed"
                        variant={"destructive"}>
                        Yes, Request Refund
                      </Button>
                    </AlertDialogAction>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs ">
                      At least 10 charecters is Required
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
}

export default function SolutionPageComps({
  solution,
}: {
  solution: SolutionById;
}) {
  const { user } = useCurrentUser();
  const [comment, setComment] = useState("");
  const latestCommentRef = useRef<HTMLDivElement>(null);
  const files = solution.solutionFiles.map((f) => {
    const {
      id,
      fileName,
      filePath,
      fileSize,
      fileType,
      storageLocation,
      uploadedAt,
    } = f.solutionFile;
    return {
      id,
      fileName,
      fileType,
      fileSize,
      storageLocation,
      filePath,
      uploadedAt,
    };
  });
  const [comments, setComments] = useState<commentType[]>(
    [...(solution?.taskSolution.taskComments ?? [])].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    })
  );
  useWebSocket<commentType>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/comments?task_id=${solution?.taskId}`,
    {
      onMessage: (comment) => {
        setComments((prev) => [...prev, comment]);
      },
    }
  );
  useEffect(() => {
    if (latestCommentRef.current) {
      latestCommentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const { mutateAsync: createTaskCommentMuta, isPending } = useMutation({
    mutationFn: createTaskComment,
    onSuccess: () => {},
  });
  async function handleSendComment() {
    if (!comment.trim()) return;
    setComment("");
    await createTaskCommentMuta({
      comment,
      taskId: solution?.taskId,
      userId: user?.id!,
      posterId: solution.taskSolution.posterId,
      solverId: solution.taskSolution.solverId,
    });
  }

  return (
    <div className="flex w-full h-full bg-background/10">
      <div className="flex-1 p-8 gap-3 flex flex-col">
        <Card className="mb-6 h-[500px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Solution</h2>
              <div className="flex items-center space-x-2">
                {GetStatusBadge(solution.taskSolution.status!)}

                <span className="text-sm text-foreground/60">
                  by {solution.taskSolution.solver?.name}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span>
                Submitted {formatDateAndTimeNUTC(solution.createdAt!)}
              </span>
              <span>•</span>
              <span>Updated {formatDateAndTimeNUTC(solution.updatedAt!)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <SolutionPreview content={solution.content!} />

            <div className="flex items-center justify-between">
              {solution.taskSolution.posterId === user?.id &&
                solution.taskSolution.status !== "COMPLETED" &&
                !solution.taskSolution.taskRefund && (
                  <div className="flex items-center justify-center space-x-4 my-6 p-4 bg-background/10 rounded-lg">
                    <AcceptSolutionDialog solution={solution} />
                    <RequestRefundDialog solution={solution} />
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
        {solution.solutionFiles.length > 0 && (
          <FilesTable files={files} scope={solution} scopeType="solution" />
        )}
        {solution.taskSolution.posterId === user?.id && (
          <Card className="lg:max-w-8xl">
            <CardHeader>
              <h3 className="text-lg font-medium text-foreground">comments</h3>
            </CardHeader>
            <CardContent className="">
              {comments.length > 0 && (
                <ScrollArea className="h-60 p-4 ">
                  <div className="space-y-4 ">
                    {comments.map((comment, index) => {
                      const isLast = index === comments.length - 1;
                      return (
                        <CommentCard
                          key={comment.id}
                          comment={comment}
                          currentUserId={user?.id!}
                          ref={isLast ? latestCommentRef : null}
                        />
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              <div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-foreground/70">
                    leave a comment
                  </span>
                </div>
                <div className="flex space-x-3 lg:max-w-8xl">
                  <Textarea
                    placeholder="Add your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    
                    className="flex-1 min-h-[80px] resize-none"
                    onKeyDown={handleKeyPress}
                  />
                  <Button
                    className="self-end"
                    onClick={handleSendComment}
                    disabled={!comment.trim() || isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
