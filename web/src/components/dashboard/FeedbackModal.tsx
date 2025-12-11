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
import { FeedbackType } from "@/drizzle/schemas";
import { cn } from "@/lib/utils/utils";
import { Star } from "lucide-react";
import { useState } from "react";

export interface FeedbackSubmitPayload {
  rating: number;
  comment: string;
  feedbackType: FeedbackType;
  posterId: string;
  solverId: string;
  taskId?: string;
  mentorBookingId?: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;

  feedbackType: FeedbackType;

  posterId: string;
  solverId: string;

  taskId?: string;
  mentorBookingId?: string;

  onSubmit: (data: FeedbackSubmitPayload) => Promise<void>;
  isSubmiting: boolean;
}

export function FeedbackModal({
  isOpen,
  onClose,
  feedbackType,
  onSubmit,
  posterId,
  solverId,
  taskId,
  mentorBookingId,
  isSubmiting,
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  async function handleSubmit() {
    await onSubmit({
      rating,
      comment,
      feedbackType,
      posterId,
      solverId,
      taskId,
      mentorBookingId,
    });

    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-lg w-full",
          "md:top-1/2 md:left-1/2 md:fixed md:-translate-x-1/2 md:-translate-y-1/2",
          "rounded-t-xl md:rounded-xl p-6",
        )}
      >
        <DialogHeader>
          <DialogTitle>Give Feedback</DialogTitle>
          <DialogDescription>
            Help us improve the SolveIt experience.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 my-3">
          {[1, 2, 3, 4, 5].map((v) => (
            <Star
              key={v}
              onClick={() => setRating(v)}
              className={cn(
                "w-7 h-7 cursor-pointer",
                v <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-400",
              )}
            />
          ))}
        </div>

        <Textarea
          className="min-h-[100px]"
          placeholder="Write your feedback..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmiting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmiting}>
            {isSubmiting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
