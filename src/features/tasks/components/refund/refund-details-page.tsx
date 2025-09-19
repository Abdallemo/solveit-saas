"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FilesTable } from "@/features/media/components/FilesTable";
import { approveRefund, rejectRefund } from "@/features/payments/server/action";
import type { ModDisputeType as Dispute } from "@/features/tasks/server/task-types";
import { useMutation } from "@tanstack/react-query";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  FileTextIcon,
  FolderIcon,
  Loader2,
  MessageSquareIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AllPreview } from "../richTextEdito/TaskPreview";

export default function DisputePageComps({
  dispute,
  canDecide,
}: {
  dispute: Dispute;
  canDecide: boolean;
}) {
  const task = dispute.taskRefund;
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmRejectInput, setConfirmRejectInput] = useState("");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { mutateAsync: ApproveRefundMutation, isPending } = useMutation({
    mutationFn: approveRefund,
    onSuccess: () =>
      toast.success("successfully approved the refund", { id: "refund-task" }),
    onError: (e) => {
      if (e.message !== "NEXT_REDIRECT") {
        toast.error(e.message, { id: "refund-task" });
      }
    },
  });
  const { mutateAsync: RejectRefundMutation, isPending: isRejecting } =
    useMutation({
      mutationFn: rejectRefund,
      onSuccess: () =>
        toast.success("successfully rejected and released the fund", {
          id: "reject-task",
        }),
      onError: (e) => {
        toast.error(e.message, { id: "reject-task" });
      },
    });
  async function handleTaskRefund() {
    toast.loading("loading", { id: "refund-task" });
    await ApproveRefundMutation(dispute.id);
    setIsRefundDialogOpen((prev) => !prev);
    setConfirmInput("");
  }
  async function handleTaskReject() {
    toast.loading("loading", { id: "reject-task" });
    await RejectRefundMutation(dispute.id);
    setIsRejectDialogOpen((prev) => !prev);
    setConfirmInput("");
  }
  return (
    <div className="h-full w-full bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dispute #{dispute.id}
          </h1>
          <p className="text-muted-foreground">
            Review dispute details and make a moderation decision
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dispute Information</span>
                <Badge
                  variant={
                    dispute.refundStatus === "PENDING" ? "secondary" : "default"
                  }>
                  {dispute.refundStatus || "PENDING"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {dispute.createdAt?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">${task.price?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Comments</p>
                    <p className="font-medium">{task.taskComments.length}</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Refund Reason</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {dispute.refundReason}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Task Details</span>
                <Badge
                  variant={
                    task.status === "COMPLETED" ? "default" : "secondary"
                  }>
                  {task.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                <p className="text-muted-foreground">{task.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-medium">Task Poster</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-medium">
                        {task.poster.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{task.poster.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {task.poster.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <ClockIcon className="h-3 w-3" />
                    <span>Deadline: {task.deadline}</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <UserIcon className="h-4 w-4" />
                    <span className="font-medium">Task Solver</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-secondary-foreground text-sm font-medium">
                        {task.solver?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{task.solver?.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {task.solver?.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    <span>
                      Assigned: {task.assignedAt?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {task.content && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    Task Content
                  </h4>
                  <AllPreview content={task.content} />
                </div>
              )}
            </CardContent>
          </Card>

          {task.taskFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderIcon className="h-4 w-4" />
                  Task Files
                  <Badge variant="secondary" className="ml-auto">
                    {task.taskFiles.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <FilesTable files={task.taskFiles} scopeType="solution" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Task Solution
                {task.taskSolution.isFinal && (
                  <Badge variant="default">Final Solution</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.taskSolution.content && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Solution Description</h4>
                  <AllPreview content={task.taskSolution.content} />
                </div>
              )}

              {task.taskSolution.solutionFiles.length > 0 && (
                <FilesTable
                  files={task.taskSolution.solutionFiles.map(
                    (item) => item.solutionFile
                  )}
                  scopeType="solution"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareIcon className="h-4 w-4" />
                Comments & Discussion
                <Badge variant="secondary" className="ml-auto">
                  {task.taskComments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {task.taskComments.map((comment, index) => {
                  const isFromPoster = comment.userId === task.posterId;
                  const isFromSolver = comment.userId === task.solverId;
                  const userRole = isFromPoster
                    ? "POSTER"
                    : isFromSolver
                    ? "SOLVER"
                    : "OTHER";
                  const userName = isFromPoster
                    ? task.poster.name
                    : isFromSolver
                    ? task.solver?.name
                    : "Unknown User";

                  return (
                    <div key={comment.id}>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-muted-foreground text-sm font-medium">
                            {userName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {userName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {userRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt?.toLocaleString()}
                            </span>
                          </div>
                          <div className="border rounded-lg p-3 bg-muted/50">
                            <p className="text-sm leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < task.taskComments.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {canDecide && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Moderation Decision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="destructive"
                      size="lg"
                      className="flex-1"
                      onClick={() => setIsRejectDialogOpen((prev) => !prev)}>
                      Reject Dispute
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={() => setIsRefundDialogOpen((prev) => !prev)}>
                      Approve Refund
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      This decision will be final and cannot be undone. Please
                      review all information carefully.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <ApproveRefundDialog
                confirmInput={confirmInput}
                setConfirmInput={setConfirmInput}
                dispute={dispute}
                isRefunding={isPending}
                isRefundDialogOpen={isRefundDialogOpen}
                setIsRefundDialogOpen={setIsRefundDialogOpen}
                handleTaskRefund={handleTaskRefund}
              />
              <RejectRefundDialog
                confirmInput={confirmRejectInput}
                setConfirmInput={setConfirmRejectInput}
                dispute={dispute}
                isRejecting={isRejecting}
                isRejectDialogOpen={isRejectDialogOpen}
                setIsRejectDialogOpen={setIsRejectDialogOpen}
                handleTaskReject={handleTaskReject}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function ApproveRefundDialog({
  isRefunding,
  isRefundDialogOpen,
  setIsRefundDialogOpen,
  dispute,
  confirmInput,
  setConfirmInput,
  handleTaskRefund,
}: {
  dispute: Dispute;

  confirmInput: string;
  isRefunding: boolean;
  isRefundDialogOpen: boolean;
  setIsRefundDialogOpen: (open: boolean) => void;
  setConfirmInput: (open: string) => void;
  handleTaskRefund: () => Promise<void>;
}) {
  return (
    <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Accept This Refund?</DialogTitle>
          <DialogDescription>
            By accepting this refund, you confirm that you are in favor of the
            poster. This action will mark the task as refunded and issue a
            refund or task re-open to the poster. .
          </DialogDescription>

          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                By typing
                <span className="font-semibold text-foreground">
                  {" "}
                  "I confirm"{" "}
                </span>
                below, you authorize the refund of the task for reason "
                <span className="font-semibold text-foreground">
                  {dispute.refundReason?.toLocaleLowerCase()}"
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {" "}
                  {dispute.taskRefund.poster.name?.toLocaleLowerCase()}
                </span>
                . This action is irreversible.
              </p>
            </div>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="mt-2"
            />
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isRefunding}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant={"success"}
            disabled={confirmInput !== "I confirm" || isRefunding}
            onClick={async () => {
              await handleTaskRefund();
            }}>
            {isRefunding && <Loader2 className="animate-spin" />} Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
function RejectRefundDialog({
  isRejecting,
  isRejectDialogOpen,
  setIsRejectDialogOpen,
  dispute,
  confirmInput,
  setConfirmInput,
  handleTaskReject,
}: {
  dispute: Dispute;

  confirmInput: string;
  isRejecting: boolean;
  isRejectDialogOpen: boolean;
  setIsRejectDialogOpen: (open: boolean) => void;
  setConfirmInput: (open: string) => void;
  handleTaskReject: () => Promise<void>;
}) {
  return (
    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Reject This Refund?</DialogTitle>
          <DialogDescription>
            By rejecting this refund, you confirm that you are in favor of the
            solver . This action will mark the task as completed and will
            release the payment.
          </DialogDescription>

          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                By typing
                <span className="font-semibold text-foreground">
                  {" "}
                  "I confirm"{" "}
                </span>
                below, you authorize the release th payment of the task to{" "}
                <span className="font-semibold text-foreground">
                  {" "}
                  {dispute.taskRefund.solver?.name?.toLocaleLowerCase()}
                </span>
                . This action is irreversible.
              </p>
            </div>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="mt-2"
            />
          </div>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isRejecting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant={"success"}
            disabled={confirmInput !== "I confirm" || isRejecting}
            onClick={async () => {
              await handleTaskReject();
            }}>
            {isRejecting && <Loader2 className="animate-spin" />} Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// <AlertDialog>
//     <AlertDialogContent>
//       <AlertDialogHeader>
//         <AlertDialogTitle>Accept This Refund?</AlertDialogTitle>
//         <AlertDialogDescription className="text-foreground">
//           By accepting this refund, you confirm that you are in favor of the
//           poster. This action will mark the task as refunded and issue a
//           refund or task re-open to the poster.
//         </AlertDialogDescription>
//       </AlertDialogHeader>
//       <AlertDialogFooter>
//         <AlertDialogCancel disabled={isRefunding} className={``}>
//           Cancel
//         </AlertDialogCancel>
//         <AlertDialogAction
//           disabled={isRefunding}
//           // onClick={async () =>
//           //   await issueRefund(selectedRefund.taskPaymentId!)
//           // }
//           className={`${"cursor-not-allowed"} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 cursor-pointer`}>
//           {isRefunding && <Loader2 className="animate-spin" />}
//           Yes, Accept Solution
//         </AlertDialogAction>
//       </AlertDialogFooter>
//     </AlertDialogContent>
//   </AlertDialog>
