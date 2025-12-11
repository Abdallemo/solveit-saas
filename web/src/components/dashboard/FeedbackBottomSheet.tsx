"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/utils";
import { Star } from "lucide-react";
import { useState } from "react";

type FeedbackType = "TASK" | "MENTORING";

interface FeedbackBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  forceFeedback?: boolean;

  feedbackType: FeedbackType;
  posterId: string;
  solverId: string;

  taskId?: string;
  mentorBookingId?: string;

  onSubmit: (data: {
    rating: number;
    comment: string;
    feedbackType: FeedbackType;
    posterId: string;
    solverId: string;
    taskId?: string;
    mentorBookingId?: string;
  }) => Promise<void>;
}

export function FeedbackBottomSheet({
  isOpen,
  onClose,
  forceFeedback = false,
  feedbackType,
  posterId,
  solverId,
  taskId,
  mentorBookingId,
  onSubmit,
}: FeedbackBottomSheetProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const title =
    feedbackType === "TASK" ? "Task Feedback" : "Mentorship Session Feedback";

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment,
        feedbackType,
        posterId,
        solverId,
        taskId: feedbackType === "TASK" ? taskId : undefined,
        mentorBookingId:
          feedbackType === "MENTORING" ? mentorBookingId : undefined,
      });

      onClose();
      setRating(5);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => (!forceFeedback ? onClose() : null)}
    >
      <DialogContent
        className={cn(
          "p-6 max-w-lg w-full rounded-t-2xl md:rounded-xl",
          "md:top-[50%] md:translate-y-[-50%] md:fixed md:left-1/2 md:translate-x-[-50%]",
          // mobile bottom sheet
          "fixed bottom-0 translate-y-0 md:relative",
          "md:bottom-auto",
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Your feedback helps maintain quality inside SolveIt.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((r) => (
            <Star
              key={r}
              onClick={() => setRating(r)}
              className={cn(
                "h-7 w-7 cursor-pointer transition",
                r <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400",
              )}
            />
          ))}
        </div>

        <Textarea
          placeholder="Write your feedback..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[130px]"
        />

        <DialogFooter className="mt-4 flex justify-end gap-3">
          {!forceFeedback && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
