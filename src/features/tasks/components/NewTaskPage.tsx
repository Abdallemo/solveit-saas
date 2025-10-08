"use client";
import Loading from "@/app/dashboard/solver/workspace/start/[taskId]/loading";
import Gates from "@/components/GateComponents";
import { Button } from "@/components/ui/button";
import { NewuseTask } from "@/contexts/TaskContext";
import { env } from "@/env/client";
import {
  autoSuggestWithAi,
  validateContentWithAi,
} from "@/features/Ai/server/action";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import NewTaskSidebar from "@/features/tasks/components/newTaskSidebar";
import TaskPostingEditor from "@/features/tasks/components/richTextEdito/Tiptap";
import {
  autoSaveDraftTask,
  createTaksPaymentCheckoutSession,
} from "@/features/tasks/server/action";
import { TaskSchema, taskSchema } from "@/features/tasks/server/task-types";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAutoSave } from "@/hooks/useAutoDraftSave";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useFileUpload } from "@/hooks/useFile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert, Loader } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function TaskCreationPage({
  defaultValues,
}: {
  defaultValues: TaskSchema;
}) {
  const { draft, selectedFiles, updateDraft } = NewuseTask(); //new Migrations
  const { category, content, deadline, description, price, title, visibility } =
    draft;
  const currentUser = useCurrentUser();
  const { user } = currentUser;
  const [isDisabled, setIsDisabled] = useState(true);
  const { isLoading: authLoading, isBlocked } = useAuthGate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { uploadMutate, isUploading } = useFileUpload({});
  const [ruleVailation, setRuleVailation] = useState(false);
  useAutoSave({
    autoSaveFn: autoSaveDraftTask,
    autoSaveArgs: [
      title,
      description,
      content,
      user?.id!,
      category,
      price,
      visibility,
      deadline,
    ],
    delay: 700,
  });

  const { mutateAsync: validateContent, isPending } = useMutation({
    mutationFn: validateContentWithAi,
    onSuccess: (d) => {
      setRuleVailation(d.violatesRules);
      toast.success("valid content", {
        id: "openai",
      });
    },
    onError: (er) => {
      toast.error(er.message);
    },
  });
  const { mutateAsync: autoSuggest, isPending: isAutoSeggesting } = useMutation(
    {
      mutationFn: autoSuggestWithAi,
      onSuccess: (d) => {},
      onError: (er) => {
        toast.error(er.message);
      },
    }
  );
  async function handleSugestions() {
    toast.loading("Ai Suggesting...", { id: "autosuggestion" });
    const res = await autoSuggest({
      content: draft.content,
    }).finally(() => {
      toast.dismiss("autosuggestion");
    });
    updateDraft({
      category: res.category,
      description: res.description,
      price: res.price,
      title: res.title,
    });
    toast.dismiss("autosuggestion");
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const doc = new DOMParser().parseFromString(content, "text/html");
    const text = doc.body.textContent?.trim() || "";

    setIsDisabled(text.length < 40);
  }, [content]);

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset({
      title,
      description,
      content,
      deadline,
      visibility,
      category,
      price,
    });
  }, [
    form,
    title,
    description,
    content,
    deadline,
    visibility,
    category,
    price,
  ]);

  if (authLoading) return <Loading />;
  if (isBlocked) return <Gates.Auth />;
  async function onSubmit(data: TaskSchema) {
    try {
      toast.loading("checking content againt our rules....", { id: "openai" });
      const ruleRes = await validateContent(data.content);
      if (ruleRes.violatesRules) {
        toast.warning(
          <div className="flex flex-col gap-2">
            <span className="font-semibold">
              Your task violates our posting rules. Try again.
            </span>
            <span>
              If you believe this is a mistake, reach out to our support team.
            </span>
          </div>,

          { id: "openai" }
        );
        return; //todo will do in the server side too
      }
      toast.loading("uploading files", { id: "file-upload" });
      let uploadedFileMetadata: UploadedFileMeta[] | undefined;
      let uploadedFilesString: string | undefined;
      if (selectedFiles && selectedFiles.length > 0) {
        uploadedFileMetadata = await uploadMutate({
          files: selectedFiles,
          scope: "task",
          url: `${env.NEXT_PUBLIC_GO_API_URL}/media`,
        }); //golang api
        uploadedFilesString = JSON.stringify(uploadedFileMetadata);
      } else {
        toast.dismiss("file-upload");
      }
      const lastUpdDraft = await autoSaveDraftTask(
        title,
        description,
        content,
        user?.id!,
        category,
        price,
        visibility,
        deadline,
        uploadedFilesString
      );
      toast.dismiss("file-upload");
      await createTaksPaymentCheckoutSession({
        content,
        price,
        userId: user?.id!,
        deadlineStr: deadline,
        draftTaskId: lastUpdDraft?.id!,
      });
    } catch (e) {
      console.error(e);
      toast.error(`${(<CircleAlert />)}something Went Wrong`);
    }
  }
  function onError(errors: FieldErrors<TaskSchema>) {
    console.warn("Validation errors ❌", errors);
    setIsSheetOpen(true);

    const firstErrorField = Object.keys(errors)[0];
    const el = document.querySelector(`[name="${firstErrorField}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return (
    <div className="flex h-full bg-background overflow-auto">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Post a Task</h1>
          <Button
            type="submit"
            form="task-form"
            disabled={
              isDisabled || isUploading || isPending || isAutoSeggesting
            }
            className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-[140px]">
            {isUploading ? (
              <>
                <Loader className="animate-spin w-4 h-4" />
                Uploading files...
              </>
            ) : (
              "Publish Task"
            )}
          </Button>
        </header>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            id="task-form"
            className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 pb-2">
                <p className="text-sm text-muted-foreground">
                  Describe the task clearly so students can understand and solve
                  it effectively.
                </p>
              </div>
              <div className="px-5 overflow-auto">
                <Suspense>
                  <TaskPostingEditor />
                </Suspense>
              </div>
            </div>
            <NewTaskSidebar
              isDisabled={isDisabled}
              open={isSheetOpen}
              setOpen={setIsSheetOpen}
              handleSugestions={handleSugestions}
              isAutoSeggesting={isAutoSeggesting}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
