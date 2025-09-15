"use client";
import Loading from "@/app/dashboard/solver/loading";
import AuthGate from "@/components/AuthGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAutoSave } from "@/hooks/useAutoDraftSave";
import { getColorClass } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { autoSaveDraftWorkspace, publishSolution } from "../server/action";
import { WorkpaceSchem, WorkpaceSchemType } from "../server/task-types";
import { DeadlineProgress } from "./DeadlineProgress";
import WorkspaceSidebar from "./richTextEdito/WorkspaceSidebar";
import WorkspaceEditor from "./richTextEdito/workspace/Tiptap";

export default function WorkspacePageComp() {
  const [isDisabled, setIsDisabled] = useState(true);
  const { content, currentWorkspace, setCurrentWorkspace } = useWorkspace();

  const { isLoading, isBlocked } = useAuthGate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const progress = DeadlineProgress();
  const router = useRouter();
  const alreadySubmitedSolution =
    currentWorkspace?.task.status == "SUBMITTED" ||
    currentWorkspace?.task.status == "COMPLETED";
  useAutoSave({
    autoSaveFn: autoSaveDraftWorkspace,
    autoSaveArgs: [
      content,
      currentWorkspace?.task.solverId!,
      currentWorkspace?.taskId!,
    ],
    delay: 700,
  });
  const { mutateAsync: publishSolutionMutation, isPending } = useMutation({
    mutationFn: publishSolution,
    onSuccess: (data) => {
      toast.success(data.message, { id: "publish-solution" });
    },
    onError: (err) => {
      toast.error(err.message, { id: "publish-solution" });
    },
  });
  useEffect(() => {
    if (typeof window === "undefined") return;

    const doc = new DOMParser().parseFromString(content!, "text/html");
    const text = doc.body.textContent?.trim() || "";

    setIsDisabled(text.length < 35);
  }, [content]);

  const form = useForm<WorkpaceSchemType>({
    resolver: zodResolver(WorkpaceSchem),
  });

  useEffect(() => {
    form.reset({
      content,
    });
  }, [form, content]);

  if (isLoading) return <Loading />;
  if (isBlocked) return <AuthGate />;

  async function onSubmit(data: WorkpaceSchemType) {
    if (progress == 100) {
      toast.error("The submission has closed");
      return;
    }
    if (!currentWorkspace?.id) {
      toast.error("Not found current workspace id");
      return;
    }
    if (
      currentWorkspace.task.status === "COMPLETED" ||
      currentWorkspace.task.status === "SUBMITTED"
    ) {
      return;
    }

    try {
      const { workspace } = await publishSolutionMutation({
        workspaceId: currentWorkspace.id,
        content: data.content,
        solverId: currentWorkspace.solverId,
      });
      setCurrentWorkspace(workspace);
      toast.success("Published successfully", { id: "publish-solution" });
    } catch (err) {
      toast.error("Failed to publish", { id: "publish-solution" });
    }
  }
  function onError(errors: FieldErrors<WorkpaceSchemType>) {
    console.warn("Validation errors ❌", errors);
    setIsSheetOpen(true);

    const firstErrorField = Object.keys(errors)[0];
    const el = document.querySelector(`[name="${firstErrorField}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return (
    <div className="flex h-full bg-background">
      <div className="flex flex-col h-full w-full">
        <header className="border-b p-4 flex items-center justify-between">
          <div className="flex gap-2">
            <h1 className="text-2xl font-semibold">Solution Workspace</h1>
            <Badge
              className={getColorClass(currentWorkspace?.task.category.name!)}>
              {currentWorkspace?.task.category.name}
            </Badge>
          </div>

          <Button
            form="solution-form"
            disabled={
              isDisabled ||
              isPending ||
              progress >= 100 ||
              alreadySubmitedSolution
            }
            className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-[140px]">
            {isPending ? ( // If uploading, show loader and text
              <>
                <Loader className="animate-spin w-4 h-4" />
                Uploading files...
              </>
            ) : progress >= 100 ? (
              "Submission Closed"
            ) : alreadySubmitedSolution ? (
              " Already Submited"
            ) : (
              "Publish Solution"
            )}
          </Button>
        </header>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            id="solution-form"
            className="flex flex-1 min-h-0">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 pb-2  flex justify-between items-center">
                <div className="mt-4  w-full">
                  <div className="ml-5 flex items-center justify-between text-sm text-foreground mb-2">
                    <Link
                      className="underline"
                      target="_blank"
                      href={`/dashboard/solver/tasks/${currentWorkspace?.taskId}`}>
                      {currentWorkspace?.task.title}
                    </Link>
                    <span>
                      {currentWorkspace?.task.status === "SUBMITTED" ||
                      currentWorkspace?.task.status === "COMPLETED"
                        ? 100
                        : progress.toFixed()}
                      % Complete
                    </span>
                  </div>
                  <div className="flex flex-col w-full items-end">
                    <Progress value={progress} className="h-2 w-full" />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-auto px-3 pt-0">
                <Suspense>
                  <WorkspaceEditor />
                </Suspense>
              </div>
            </div>
            <WorkspaceSidebar open={isSheetOpen} setOpen={setIsSheetOpen} />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
