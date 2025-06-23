"use client";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkpaceSchem, WorkpaceSchemType } from "../server/task-types";
import { toast } from "sonner";
import { CircleAlert, Loader } from "lucide-react";
import WorkspaceSidebar from "./richTextEdito/WorkspaceSidebar";
import WorkspaceEditor from "./richTextEdito/workspace/Tiptap";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { DeadlineProgress } from "./DeadlineProgress";
import { autoSaveDraftWorkspace } from "../server/action";
import { useAutoSave } from "@/hooks/useAutoDraftSave";
import { useAuthGate } from "@/hooks/useAuthGate";
import AuthGate from "@/components/AuthGate";
import Loading from "@/app/dashboard/solver/loading";

export default function WorkspacePageComp() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const { content, currentWorkspace } = useWorkspace();
  const [progress, setProgress] = useState(0);
  const { isLoading, isBlocked } = useAuthGate(10000);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useAutoSave({
    autoSaveFn: autoSaveDraftWorkspace,
    autoSaveArgs: [
      content,
      currentWorkspace?.task.solverId!,
      currentWorkspace?.taskId!,
    ],
    delay: 700,
  });
  useEffect(() => {
    if (typeof window === "undefined") return;

    const doc = new DOMParser().parseFromString(content!, "text/html");
    const text = doc.body.textContent?.trim() || "";

    setIsDisabled(text.length < 5);
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
    toast.warning("Currently Solution Publishing is under Construction ");
    try {
      setIsUploading(true);
      setIsUploading(false);
    } catch (e) {
      console.error(e);
      toast.error(`${(<CircleAlert />)}something Went Wrong`);
    }
  }
  function onError(errors:FieldErrors<WorkpaceSchemType>) {
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
          <h1 className="text-2xl font-semibold">Solution Workspace</h1>
          <Button
            form="solution-form"
            disabled={isDisabled || isUploading}
            className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-[140px]">
            {isUploading ? (
              <>
                <Loader className="animate-spin w-4 h-4" />
                Uploading files...
              </>
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
                    <span>{currentWorkspace?.task.title}</span>
                    <span>{progress.toFixed()}% Complete</span>
                  </div>
                  <div className="flex flex-col w-full items-end">
                    <DeadlineProgress
                      progress={progress}
                      setProgress={setProgress}
                      createdAt={currentWorkspace?.createdAt!}
                      deadlineValue={currentWorkspace?.task.deadline!}
                    />
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
