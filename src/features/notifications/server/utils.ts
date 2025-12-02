import { refundType } from "@/features/payments/server/types";
import { Notifier } from "./notifier";

export function notifyRefundApproval(refund: refundType) {
  Notifier()
    .system({
      subject: "Refund Accepted",
      receiverId: refund.taskRefund?.posterId!,
      content: `Your refund for the dispute with ID ${refund.id} has been Accepted.Please Take action with in 7days or The amount of ${refund.taskRefund?.price} will be returned to your original payment method.`,
    })
    .email({
      subject: "Refund Accepted",
      receiverEmail: refund.taskRefund?.poster.email!,
      content: `<h3>Your refund for the dispute with ID ${refund.id} has been Accepted.</h3>
      Please Take action with in 7days or The amount of ${refund.taskRefund?.price} will be returned to your original payment method.`,
    });

  Notifier()
    .system({
      subject: "Dispute Resolved",
      receiverId: refund.taskRefund?.solverId!,
      content: `The dispute for task ID ${refund.taskRefund?.id} has been resolved in the poster's favor.
        The held payment has been refunded to them and will not be disbursed to you.`,
    })
    .email({
      subject: "Dispute Resolved",
      receiverEmail: refund.taskRefund?.solver?.email!,
      content: `The dispute for task ID ${refund.taskRefund?.id} has been resolved in the poster's favor.
        The held payment has been refunded to them and will not be disbursed to you.`,
    });
}
export function notifyTaskReopen(refund: refundType) {
  Notifier()
    .system({
      receiverId: refund.taskRefund?.posterId!,
      content: `You have chosen to re-open task ID ${refund.taskRefund?.id}. The task is now available for other solvers to apply.`,
      subject: "Task Re-opened",
    })
    .email({
      receiverEmail: refund.taskRefund?.poster.email!,
      content: `You have chosen to re-open task ID ${refund.taskRefund?.id}. The task is now available for other solvers to apply.`,
      subject: "Task Re-opened",
    });
}
export function notifyRefundComplete(refund: refundType) {
  Notifier()
    .system({
      receiverId: refund.taskRefund?.posterId!,
      subject: "Refund Processed",
      content: `Your refund for the dispute with ID ${refund.id} has been successfully processed.
    The amount of ${refund.taskRefund?.price} will be returned to your original payment method.`,
    })
    .email({
      receiverEmail: refund.taskRefund?.poster.email!,
      subject: "Refund Processed",
      content: `<h4>Your refund for the dispute with ID ${refund.id} has been successfully processed</h4>.
    The amount of ${refund.taskRefund?.price} will be returned to your original payment method.`,
    });
}
