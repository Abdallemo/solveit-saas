"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { SolutionPreview } from "./richTextEdito/TaskPreview";
import {
  acceptSolution,
  requestRefund,
  type SolutionById,
} from "../server/action";
import type { TaskStatusType } from "@/drizzle/schemas";
import { FilesTable } from "@/features/media/components/FilesTable";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormField } from "@/components/ui/form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { taskRefundSchemaType } from "@/features/tasks/server/action";
import { taskRefundSchema } from "@/features/tasks/server/task-types";
import { useMutation } from "@tanstack/react-query";

function AcceptSolutionDialog({
  solution,
}: {

  solution: SolutionById;
}) {
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

function RequestRefundDialog({

  solution,
}: {
  solution: SolutionById;
}) {
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
    await requestRefundMutate({reason:formData.reason,solution});
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant="destructive"
            className="flex items-center space-x-2">
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
              <AlertDialogHeader>
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
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              {isValid ? (
                <Button
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
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"destructive"}
                      disabled={false}
                      className="opacity-45 cursor-not-allowed">
                      Yes, Request Refund
                    </Button>
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
  const router = useRouter();
  const [comment, setComment] = useState("");
  if (!user || !user.id) {
    router.back();
  }
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

  const getStatusBadge = (status: TaskStatusType) => {
    const variants = {
      ASSIGNED: "bg-green-100 text-green-600",
      COMPLETED: "bg-green-100 text-green-800",
      // pending: "bg-yellow-100 text-yellow-800",

      CANCELED: "bg-red-100 text-red-800",
    };
    return variants[status as keyof typeof variants] || variants.ASSIGNED;
  };

  const comments = [
    {
      id: "comment_001",
      author: "task_user",
      content:
        "This worked perfectly! Thank you so much for the detailed explanation.",
      createdAt: "1 hour ago",
      avatar: "TU",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background/10">
      <div className="flex-1 p-8 gap-3 flex flex-col">
        <BreadcrumbSolution />
        <Card className="mb-6 mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl text-foreground font-bold">Solution</h2>
              <div className="flex items-center space-x-2">
                <Badge
                  className={getStatusBadge(solution.taskSolution.status!)}>
                  {solution.taskSolution.status}
                </Badge>
                <span className="text-sm text-foreground/60">
                  by {solution.taskSolution.solver?.name}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Submitted {solution.createdAt?.toLocaleString()}</span>
              <span>•</span>
              <span>Updated {solution.updatedAt?.toLocaleDateString()}</span>
            </div>
          </CardHeader>
          <CardContent>
            <SolutionPreview content={solution.content!} />

            {solution.taskSolution.posterId === user?.id &&
              solution.taskSolution.status !== "COMPLETED" &&
              !solution.taskSolution.taskRefund && (
                <div className="flex items-center justify-center space-x-4 my-6 p-4 bg-background/10 rounded-lg">
                  <AcceptSolutionDialog
                    solution={solution}
                  />
                  <RequestRefundDialog

                    solution={solution}
                  />
                </div>
              )}

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-transparent">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful ({"12"})</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-transparent">
                  <ThumbsDown className="h-4 w-4" />
                  <span>Not helpful ({"1"})</span>
                </Button>
              </div>
              {/* TODO */}
              {false && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  ⭐ Best Solution
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        {solution.solutionFiles.length > 0 && (
          <FilesTable files={files} scope={solution} scopeType="solution" />
        )}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-foreground">comments</h3>
          </CardHeader>
          <CardContent>
            {comments.length > 0 && (
              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">
                          {comment.author}
                        </span>
                        <span className="text-sm text-foreground/60">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-foreground/80">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Separator className="mb-4" />
            <div>
              <div className="mb-2">
                <span className="text-sm font-medium text-foreground/70">
                  leave a comment
                </span>
              </div>
              <div className="flex space-x-3">
                <Textarea
                  placeholder="Add your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 min-h-[80px] resize-none"
                />
                <Button className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function BreadcrumbSolution() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">explore tasks</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">task_0001</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>solution</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
