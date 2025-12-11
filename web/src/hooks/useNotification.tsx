"use client";

import {
  deleteNotification,
  markAllAsRead,
  notificationReadUpdate,
} from "@/features/notifications/server/action";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useNotificationDelete() {
  const {
    mutateAsync: deleteNotificationMuta,
    isPending: isUploading,
    data: uploadedFilesData,
    error: uploadError,
  } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      toast.success("seccessfully deleted", { id: "delete-notification" });
    },
    onError: (e) => {
      toast.error("unable to delete," + e, { id: "delete-notification" });
    },
  });

  return {
    deleteNotificationMuta,
    isUploading,
    uploadedFilesData,
    uploadError,
  };
}
export function useNotificationRead() {
  const {
    mutateAsync: ReadMuta,
    isPending: isUploading,
    data: uploadedFilesData,
    error: uploadError,
  } = useMutation({
    mutationFn: notificationReadUpdate,
    onSuccess: (read) => {
      toast.success(read?"marked as read":"marked as unread", { id: "mark-as-read" });
    },
    onError: (e) => {
      toast.error("unable to delete," + e, { id: "mark-as-read" });
    },
  });

  return { ReadMuta, isUploading, uploadedFilesData, uploadError };
}
export function useNotificationMarkAllAsRead() {
  const {
    mutateAsync: markAllAsReadMuta,
    isPending: isUploading,
    data: uploadedFilesData,
    error: uploadError,
  } = useMutation({
      mutationFn: markAllAsRead,
      onSuccess: () => {
        toast.success("marked all as read", { id: "mark-all-as-read" });
      },
      onError: (e) => {
        toast.error("unable to delete," + e, { id: "mark-all-as-read" });
      },
  });

  return { markAllAsReadMuta, isUploading, uploadedFilesData, uploadError };
}
