"use client";
import Loading from "@/app/dashboard/solver/loading";
import { AuthGate } from "@/components/GateComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Editor } from "@tiptap/react";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import MediaPreviewer from "@/features/media/components/MediaPreviewer";
import { DeadlineProgress } from "@/features/tasks/components/DeadlineProgress";
import WorkspaceSidebar from "@/features/tasks/components/richTextEdito/WorkspaceSidebar";
import {
  autoSaveDraftWorkspace,
  publishSolution,
} from "@/features/tasks/server/action";
import {
  MIN_CONTENT_LENGTH,
  WorkpaceSchem,
  WorkpaceSchemType,
} from "@/features/tasks/server/task-types";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAutoSave, useDebouncedCallback } from "@/hooks/useAutoDraftSave";
import {
  calculateEditorTextLength,
  cn,
  getColorClass,
} from "@/lib/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Clock, Loader } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import PostingEditor from "./richTextEdito/BlogTiptap";

export default function WorkspacePageComp() {
  const {
    content,
    currentWorkspace,
    setCurrentWorkspace,
    setContent,
    setFilePreview,
    filePreview,
    uploadedFiles,
  } = useWorkspace();
  const { isLoading, isBlocked } = useAuthGate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const {
    progress,
    deadline,
    isLoading: isDeadlineLoading,
  } = DeadlineProgress();

  const contentTextLength = useMemo(() => {
    if (!content) return 0;
    return calculateEditorTextLength(content);
  }, [content]);
  const isDisabled = contentTextLength <= MIN_CONTENT_LENGTH;

  const alreadySubmitedSolution =
    currentWorkspace?.task.status == "SUBMITTED" ||
    currentWorkspace?.task.status == "COMPLETED";
  const blockedFromTask =
    currentWorkspace?.task.blockedSolvers &&
    currentWorkspace?.task.blockedSolvers.length > 0
      ? true
      : false;
  const workEnded = blockedFromTask || alreadySubmitedSolution;

  const { mutateAsync: publishSolutionMutation, isPending } = useMutation({
    mutationFn: publishSolution,
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error, { id: "publish-solution" });
      } else if (data.success) {
        toast.success(data.success, { id: "publish-solution" });
        setCurrentWorkspace(data.workspace);
      }
    },
  });

  const form = useForm({
    resolver: zodResolver(WorkpaceSchem),
  });

  const handleEditorChange = useDebouncedCallback(
    (editor: Editor) => {
      if (!editor) return;

      const jsonContent = editor.getJSON();

      form.setValue("content", jsonContent, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setContent(jsonContent);
    },
    200,
    [setContent, form],
  );

  useAutoSave({
    autoSaveFn: autoSaveDraftWorkspace,
    autoSaveArgs: [
      JSON.stringify(content),
      currentWorkspace?.task.solverId!,
      currentWorkspace?.taskId!,
    ],
    delay: 700,
    disabled: workEnded,
  });

  useEffect(() => {
    form.reset({
      content,
    });
  }, [form, content]);

  if (isLoading) return <Loading />;
  if (isBlocked) return <AuthGate />;

  async function onSubmit(data: WorkpaceSchemType) {
    try {
      await publishSolutionMutation({
        workspaceId: currentWorkspace?.id!,
        content: data.content,
        solverId: currentWorkspace?.solverId!,
      });
    } catch (err) {}
  }
  function onError(errors: FieldErrors<WorkpaceSchemType>) {
    console.warn("Validation errors ", errors);
    setIsSheetOpen(true);

    const firstErrorField = Object.keys(errors)[0];
    const el = document.querySelector(`[name="${firstErrorField}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <MediaPreviewer
        fileRecords={uploadedFiles}
        filePreview={filePreview}
        onClose={() => {
          setFilePreview(null);
        }}
      />
      <header className="border-b p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-6 items-center">
          <h1 className="text-2xl font-semibold">Solution Workspace</h1>
          <Badge
            className={cn(
              getColorClass(currentWorkspace?.task.category.name!),
              "h-6",
            )}
          >
            {currentWorkspace?.task.category.name}
          </Badge>
        </div>

        <div className="flex gap-3 items-center">
          {isDeadlineLoading ? (
            <Skeleton className="w-65 h-5" />
          ) : (
            <span className="flex items-center gap-2">
              <span className="font-semibold">
                {workEnded ? "Ended on" : "Ends on"}
              </span>
              <Clock className="size-4" />
              {deadline}
            </span>
          )}

          <Button
            form="solution-form"
            disabled={isDisabled || isPending || workEnded}
            className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-[140px]"
          >
            {isPending ? (
              <>
                <Loader className="animate-spin w-4 h-4" />
                Uploading files...
              </>
            ) : progress >= 100 || blockedFromTask ? (
              "Submission Closed"
            ) : alreadySubmitedSolution ? (
              " Already Submited"
            ) : (
              "Publish Solution"
            )}
          </Button>
        </div>
      </header>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          id="solution-form"
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-4 pb-2  flex justify-between items-center">
            <div className="w-full">
              <div className=" flex items-center justify-between text-sm text-foreground mb-2">
                <Link
                  className="underline text-lg"
                  target="_blank"
                  href={`/dashboard/solver/tasks/${currentWorkspace?.taskId}`}
                >
                  {currentWorkspace?.task.title}
                </Link>
                {isDeadlineLoading ? (
                  <Skeleton className="w-30 h-5" />
                ) : (
                  <span>{workEnded ? 100 : progress.toFixed()}% Complete</span>
                )}
              </div>
              <div className="flex flex-col w-full items-end">
                <Progress
                  value={workEnded ? 100 : progress}
                  className="h-2 w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 border-r flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto overflow-x-auto">
                <div className="px-6 py-6 min-w-fit">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Suspense>
                            <PostingEditor
                              content={content}
                              onChange={({ editor }) => {
                                handleEditorChange(editor);
                              }}
                              editorOptions={{
                                editable: !workEnded,
                              }}
                            />
                          </Suspense>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <WorkspaceSidebar open={isSheetOpen} setOpen={setIsSheetOpen} />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
