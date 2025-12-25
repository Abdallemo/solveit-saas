// Client component
"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function StripeCheckoutSuccessClient({
  publishedSuccessfully,
}: {
  publishedSuccessfully: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (publishedSuccessfully) {
      toast.success("Task published successfully!", { id: "task-publish" });
    } else {
      toast.error("Unable to publish the task", { id: "task-publish" });
    }

    router.replace(window.location.pathname);
  }, [publishedSuccessfully, router]);

  return null;
}
