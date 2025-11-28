"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { completeRefund, reopenTask } from "@/features/payments/server/action";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UserDisputeswithTask } from "../../server/task-types";

interface DisputesPageProps {
  disputes: UserDisputeswithTask[];
}

export function DisputesPage({ disputes }: DisputesPageProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmTaskOpenInput, setConfirmTaskOpenInput] = useState("");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
  const router = useRouter();
  const { user } = useCurrentUser();
  const handleRefundDialogChange = (open: boolean) => {
    setIsRefundDialogOpen(open);
    if (!open) {
      setSelectedDispute(null);
      setConfirmInput("");
    }
  };

  const handleReopenDialogChange = (open: boolean) => {
    setIsReopenDialogOpen(open);
    if (!open) {
      setSelectedDispute(null);
      setConfirmTaskOpenInput("");
    }
  };

  const [selectedDispute, setSelectedDispute] =
    useState<UserDisputeswithTask | null>(null);
  const { mutateAsync: completeRefundMutation, isPending: isRefunding } =
    useMutation({
      mutationFn: completeRefund,
      onSuccess: ({ error, success }) => {
        if (error) {
          toast.error(error, { id: "refund-complete" });
        }
        if (success) {
          toast.success(success, {
            id: "refund-complete",
          });
          setIsRefundDialogOpen((prev) => !prev);
          router.refresh();
        }
      },
    });

  const { mutateAsync: reopenTaskMutation, isPending: isReopening } =
    useMutation({
      mutationFn: reopenTask,
      onSuccess: ({ error, success }) => {
        if (error) {
          toast.error(error, { id: "opening-complete" });
        }

        if (success) {
          toast.success(success, {
            id: "opening-complete",
          });
          router.refresh();
          setIsReopenDialogOpen((prev) => !prev);
        }
      },
      onError: () => {},
    });
  async function handleCompleteRefund(refundId: string) {
    toast.loading("refunding....", { id: "refund-complete" });
    await completeRefundMutation(refundId);
    setConfirmTaskOpenInput("");
    setConfirmInput("");
  }
  async function handleReopenTask(refundId: string) {
    toast.loading("re-opening Task....", { id: "opening-complete" });
    await reopenTaskMutation(refundId);
    setConfirmTaskOpenInput("");
    setConfirmInput("");
  }
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Disputes</h1>

      {disputes.length === 0 ? (
        <p className="text-muted-foreground">No disputes found.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Card key={d.tasks.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{d.tasks.title}</CardTitle>
                    <CardDescription>
                      Created{" "}
                      {d.tasks.createdAt
                        ? new Date(d.tasks.createdAt).toLocaleDateString()
                        : "N/A"}
                    </CardDescription>
                  </div>
                  {d.refunds && (
                    <Badge variant="outline" className="uppercase">
                      {d.refunds.refundStatus ?? "UNKNOWN"}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {d.tasks.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {d.tasks.description}
                  </p>
                )}

                {d.refunds?.refundReason && (
                  <div className="text-sm">
                    <span className="font-medium">Refund Reason: </span>
                    {d.refunds.refundReason}
                  </div>
                )}

                {d.tasks.price !== null && (
                  <div className="text-sm">
                    <span className="font-medium">Price: {d.tasks.price}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                {user &&
                  user.role === "POSTER" &&
                  d.refunds.refundStatus === "PENDING_USER_ACTION" && (
                    <>
                      <Button
                        disabled={isRefunding}
                        onClick={() => {
                          setSelectedDispute(d);
                          setIsRefundDialogOpen(true);
                        }}
                        variant={"secondary"}>
                        Get Refund
                      </Button>
                      <Button
                        disabled={isReopening}
                        onClick={() => {
                          setSelectedDispute(d);
                          setIsReopenDialogOpen(true);
                        }}>
                        Reopen Task
                      </Button>
                    </>
                  )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {selectedDispute && (
        <>
          <CompleteRefundDialog
            confirmInput={confirmInput}
            setConfirmInput={setConfirmInput}
            isRefundDialogOpen={isRefundDialogOpen}
            setIsRefundDialogOpen={handleRefundDialogChange}
            handleCompleteRefund={async () =>
              handleCompleteRefund(selectedDispute.refunds.id)
            }
            isRefunding={isRefunding}
            refund={selectedDispute}
          />
          <ReopenTaskDialog
            confirmInput={confirmTaskOpenInput}
            setConfirmInput={setConfirmTaskOpenInput}
            isReopenDialogOpen={isReopenDialogOpen}
            setIsReopenDialogOpen={handleReopenDialogChange}
            handleReopenTask={async () =>
              handleReopenTask(selectedDispute.refunds.id)
            }
            isReopening={isReopening}
          />{" "}
        </>
      )}
      {/* <*/}
    </div>
  );
}

function CompleteRefundDialog({
  isRefunding,
  isRefundDialogOpen,
  setIsRefundDialogOpen,
  refund,
  confirmInput,
  setConfirmInput,
  handleCompleteRefund,
}: {
  refund: UserDisputeswithTask;
  confirmInput: string;
  isRefunding: boolean;
  isRefundDialogOpen: boolean;
  setIsRefundDialogOpen: (open: boolean) => void;
  setConfirmInput: (open: string) => void;
  handleCompleteRefund: () => Promise<void>;
}) {
  return (
    <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Refund?</DialogTitle>
          <DialogDescription>
            By confirming this action, you choose to receive a full refund for
            the task. The amount will be returned to your original payment
            method.
          </DialogDescription>

          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                By typing
                <span className="font-semibold text-foreground">
                  {" "}
                  "I confirm"{" "}
                </span>
                below, you authorize the refund of
                <span className="font-bold text-foreground">
                  {" "}
                  RM{refund.tasks.price}
                </span>
                .{""}This action will mark the task as closed.
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
            onClick={async () => await handleCompleteRefund()}>
            {isRefunding && <Loader2 className="animate-spin" />} Get Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReopenTaskDialog({
  isReopening,
  isReopenDialogOpen,
  setIsReopenDialogOpen,
  confirmInput,
  setConfirmInput,
  handleReopenTask,
}: {
  confirmInput: string;
  isReopening: boolean;
  isReopenDialogOpen: boolean;
  setIsReopenDialogOpen: (open: boolean) => void;
  setConfirmInput: (open: string) => void;
  handleReopenTask: () => Promise<void>;
}) {
  return (
    <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Re-open Task?</DialogTitle>
          <DialogDescription>
            By confirming this action, you will forfeit your refund for the
            task. The task will be re-opened for other solvers to apply.
          </DialogDescription>

          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                By typing
                <span className="font-semibold text-foreground">
                  {" "}
                  "I confirm"{" "}
                </span>
                below, you confirm that you want to re-open the task for other
                solvers. This action will mark the dispute as resolved.
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
            <Button variant="outline" disabled={isReopening}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant={"success"}
            disabled={confirmInput !== "I confirm" || isReopening}
            onClick={async () => {
              await handleReopenTask();
            }}>
            {isReopening && <Loader2 className="animate-spin" />} Re-open Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
