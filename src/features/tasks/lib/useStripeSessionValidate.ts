"use client";
import { useRouter } from "next/navigation";
import { getDraftTask } from "../server/action";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function useStripeSessionValidate(
  prevDraftTask: string
) {
  const router = useRouter();
  const hasShownToast = useRef(false);
  const { user } = useCurrentUser();

  const { data: draftTaskExists, isLoading: isLoadingTsk } = useQuery({
    queryKey: ["prv-draft", prevDraftTask],
    enabled: !!prevDraftTask,
    queryFn: async () => {
      const res = await getDraftTask(user?.id!, prevDraftTask!);
      return !!res;
    },
  });
  useEffect(() => {
    if (isLoadingTsk || hasShownToast.current) {
      return;
    }
    if (!draftTaskExists) {
      toast.success("Task published successfully!", { id: "task-publish" });
      router.replace(window.location.pathname);
      hasShownToast.current = true;
    } else if (prevDraftTask && draftTaskExists) {
      toast.error("Unable to publish the task", { id: "task-publish" });
      router.replace(window.location.pathname);
      hasShownToast.current = true;
    }
  }, [router, draftTaskExists, isLoadingTsk, prevDraftTask]);
}
