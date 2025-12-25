"use client";
import { FeedbackController } from "@/components/dashboard/FeedbackController";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useComments } from "@/contexts/TaskCommentProvider";
import { FilesTable } from "@/features/media/components/FilesTable";
import { CommentCard } from "@/features/tasks/components/richTextEdito/WorkspaceSidebar";
import GetStatusBadge from "@/features/tasks/components/taskStatusBadge";
import {
  acceptSolution,
  createTaskComment,
  requestRefund,
  submitFeadback,
} from "@/features/tasks/server/action";
import {
  SolutionById,
  taskRefundSchema,
  taskRefundSchemaType,
} from "@/features/tasks/server/task-types";
import { User } from "@/features/users/server/user-types";
import { formatDateAndTimeNUTC } from "@/lib/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
//import PostingEditor from "./richTextEdito/BlogTiptap";
const PostingEditor = dynamic(
  () => import("@/features/tasks/components/richTextEdito/MainTiptapEditor"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-172.5 md:h-175 lg:h-195" />,
  },
);
function AcceptSolutionDialog({ solution }: { solution: SolutionById }) {
  const router = useRouter();
  const { mutateAsync: acceptSolutionMuta, isPending } = useMutation({
    mutationFn: acceptSolution,
    onSuccess: ({ error, success }) => {
      if (error) {
        toast.error(error, { id: "accept-task" });
      }
      if (success) {
        toast.success(success, {
          id: "accept-task",
        });
      }
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
            className={`${isPending ? "cursor-not-allowed" : ""} `}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleAccept}
            className={`${
              isPending ? "cursor-not-allowed" : ""
            } bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 cursor-pointer`}
          >
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
    onSuccess: ({ error, success }) => {
      if (error) {
        toast.error(error, { id: "refund-request" });
      }
      if (success) {
        toast.success(success, { id: "refund-request" });
      }
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
            className="flex items-center space-x-2 "
          >
            <XCircle className="h-4 w-4" />
            <span>Request Refund</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <form onSubmit={form.handleSubmit(handleRefund)} className="min-w-0">
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

              <Button
                type="submit"
                disabled={!isValid || isPending}
                className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 cursor-pointer flex items-center space-x-2 px-4 py-2 rounded"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    <span>Sending Your Refund Request</span>
                  </>
                ) : (
                  "Yes, Request Refund"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
}

export default function SolutionPageComps({
  solution,
  user,
  isFeedbackSumbited,
}: {
  solution: SolutionById;
  user: User;
  isFeedbackSumbited: boolean;
}) {
  const { comments, setComments, send } = useComments();
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
    onSuccess: (data) => {
      if (data) {
        setComments((prev) => [...prev, data]);
        send(data);
      }
    },
  });
  const { mutateAsync: submitFeadbackMutation, isPending: isSubmiting } =
    useMutation({
      mutationFn: submitFeadback,
      onMutate: () => {
        toast.loading("submitting..", { id: "feedback-submition" });
      },

      onSuccess: ({ error }) => {
        if (error) {
          toast.error(error, { id: "feedback-submition" });
          return;
        }
        toast.success("Thanks for your feedback.", {
          id: "feedback-submition",
        });
      },
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
    <div className="flex-1 w-full h-full ">
      {solution.taskSolution.posterId === user.id && (
        <FeedbackController
          isSubmiting={isSubmiting}
          feedbackType="TASK"
          onSubmitFeedback={async (data) => {
            await submitFeadbackMutation(data);
          }}
          posterId={solution.taskSolution.posterId}
          hasFeedbackAlready={isFeedbackSumbited}
          solverId={solution.taskSolution.solverId!}
          taskId={solution.taskSolution.id}
        />
      )}
      <div className="grid grid-cols-1 w-full gap-3 p-4 md:p-8 ">
        <Card className="mb-6 h-[700px]">
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
            <div className="w-full flex flex-col items-end h-[500px]">
              <Suspense fallback={<Loader2 className="animate-spin w-2" />}>
                <PostingEditor
                  content={solution.content!}
                  editorOptions={{ editable: false }}
                  showMenuBar={false}
                  className="w-full border-0"
                />
              </Suspense>
            </div>

            <div className="flex items-center justify-end w-full px-2 ">
              {solution.taskSolution.posterId === user?.id &&
                solution.taskSolution.status !== "COMPLETED" &&
                !solution.taskSolution.taskRefund && (
                  <div className="flex items-center justify-center space-x-4 my-6 p-4 bg-background/10 rounded-lg ">
                    <AcceptSolutionDialog solution={solution} />
                    <RequestRefundDialog solution={solution} />
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
        {solution.solutionFiles.length > 0 && (
          <div className="w-full min-w-0">
            <FilesTable files={files} scope={solution} scopeType="solution" />
          </div>
        )}
        {solution.taskSolution.posterId === user?.id && (
          <Card className="lg:max-w-8xl ">
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
                    className="flex-1 min-h-20 resize-none"
                    onKeyDown={handleKeyPress}
                  />
                  <Button
                    className="self-end"
                    onClick={handleSendComment}
                    disabled={!comment.trim() || isPending}
                  >
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
