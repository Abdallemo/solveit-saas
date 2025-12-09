"use client";

import { FeedbackType } from "@/drizzle/schemas";
import { useState } from "react";
import { FeedbackBannerFloating } from "./FeedbackBannerFloating";
import { FeedbackChevronToggle } from "./FeedbackChevronToggle";
import { FeedbackModal } from "./FeedbackModal";

export interface FeedbackControllerProps {
  hasFeedbackAlready: boolean; // from DB
  feedbackType: FeedbackType;
  posterId: string;
  solverId: string;
  taskId?: string;
  mentorBookingId?: string;
  onSubmitFeedback: (data: {
    rating: number;
    comment: string;
    feedbackType: FeedbackType;
    posterId: string;
    solverId: string;
    taskId?: string;
    mentorBookingId?: string;
  }) => Promise<void>;
  isSubmiting: boolean;
}

// ---------- Component ----------
export function FeedbackController({
  hasFeedbackAlready,
  feedbackType,
  posterId,
  solverId,
  taskId,
  mentorBookingId,
  onSubmitFeedback,
  isSubmiting,
}: FeedbackControllerProps) {
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  function dismissBanner() {
    setBannerDismissed(true);
  }

  if (hasFeedbackAlready) return null;

  return (
    <>
      {bannerDismissed ? (
        <FeedbackChevronToggle
          onExpandBanner={() => setBannerDismissed(false)}
        />
      ) : (
        <FeedbackBannerFloating
          onOpenModal={() => setOpenModal(true)}
          onCloseBanner={dismissBanner}
        />
      )}

      {/* Modal */}
      <FeedbackModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        feedbackType={feedbackType}
        posterId={posterId}
        solverId={solverId}
        taskId={taskId}
        mentorBookingId={mentorBookingId}
        onSubmit={onSubmitFeedback}
        isSubmiting={isSubmiting}
      />
    </>
  );
}
