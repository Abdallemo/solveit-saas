"use client";
import Loading from "@/app/dashboard/solver/workspace/start/[taskId]/loading";
import { AuthGate } from "@/components/GateComponents";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { NewuseTask } from "@/contexts/TaskContext";
import {
  autoSuggestWithAi,
  validateContentWithAi,
} from "@/features/Ai/server/action";
import MediaPreviewer from "@/features/media/components/MediaPreviewer";
import NewTaskSidebar from "@/features/tasks/components/newTaskSidebar";
import {
  createTaksPaymentCheckoutSession,
  saveDraftTask,
} from "@/features/tasks/server/action";
import {
  MIN_CONTENT_LENGTH,
  TaskSchema,
  taskSchema,
} from "@/features/tasks/server/task-types";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useAutoSave } from "@/hooks/useAutoDraftSave";
import useCurrentUser from "@/hooks/useCurrentUser";
import { calculateEditorTextLength } from "@/lib/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Editor } from "@tiptap/react";
import { debounce } from "lodash";
import { CircleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import PostingEditor from "./richTextEdito/BlogTiptap";
import { CustomeTextSerializersForAi } from "./richTextEdito/tiptap-ai-content-selized";

export default function TaskCreationPage({
  defaultValues,
}: {
  defaultValues: TaskSchema;
}) {
  const { draft, updateDraft,filePreview,setFilePreview } = NewuseTask(); //new Migrations
  const {
    category,
    content,
    deadline,
    description,
    price,
    title,
    visibility,
    uploadedFiles,
    contentText,
  } = draft;
  const currentUser = useCurrentUser();
  const { user } = currentUser;
  const [isDisabled, setIsDisabled] = useState(true);
  const { isLoading: authLoading, isBlocked } = useAuthGate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { mutateAsync: validateContent, isPending } = useMutation({
    mutationFn: validateContentWithAi,
    onMutate: () => {
      toast.loading("checking content againt our rules....", { id: "openai" });
    },
    onSuccess: (d) => {
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
      content: contentText,
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
    const textLength = calculateEditorTextLength(content);
    setIsDisabled(textLength <= MIN_CONTENT_LENGTH);
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
  useAutoSave({
    autoSaveFn: saveDraftTask,
    autoSaveArgs: [
      title,
      description,
      JSON.stringify(content),
      contentText,
      user?.id!,
      category,
      price,
      visibility,
      deadline,
      uploadedFiles,
    ],
    delay: 700,
  });

  const handleEditorChange = useMemo(
    () =>
      debounce((editor: Editor) => {
        if (!editor) return;
        const jsonContent = editor.getJSON();
        const textContent = editor.getText({
          textSerializers: CustomeTextSerializersForAi,
        });

        form.setValue("content", jsonContent, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        updateDraft({
          content: jsonContent,
          contentText: textContent,
        });

        console.log("Debounced Update Triggered");
      }, 500),
    [updateDraft, form]
  );
  useEffect(() => {
    return () => {
      handleEditorChange.cancel();
    };
  }, [handleEditorChange]);

  if (authLoading) return <Loading />;
  if (isBlocked) return <AuthGate />;
  async function onSubmit(data: TaskSchema) {
    try {
      const ruleRes = await validateContent({
        content: contentText,
        adminMode: false,
      });
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
        return;
      }

      const lastUpdDraft = await saveDraftTask(
        title,
        description,
        JSON.stringify(content),
        contentText,

        user?.id!,
        category,
        price,
        visibility,
        deadline,
        uploadedFiles
      );
      toast.dismiss("file-upload");
      await createTaksPaymentCheckoutSession({
        content: contentText,
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
    <div className="h-full bg-background flex flex-col">
            <MediaPreviewer
              fileRecords={draft.uploadedFiles || []}
              filePreview={filePreview}
              onClose={() => setFilePreview(null)}
            />
      
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Post a Task</h1>
        <Button
          type="submit"
          form="task-form"
          disabled={isDisabled || isPending || isAutoSeggesting}
          className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-[140px]">
          Publish Task
        </Button>
      </header>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          id="task-form"
          className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 pb-2">
            <p className="text-sm text-muted-foreground">
              Describe the task clearly so students can understand and solve it
              effectively.
            </p>
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
                          <PostingEditor
                            content={content}
                            onChange={({ editor }) => {
                              handleEditorChange(editor);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <NewTaskSidebar
              isDisabled={isDisabled}
              open={isSheetOpen}
              setOpen={setIsSheetOpen}
              handleSugestions={handleSugestions}
              isAutoSeggesting={isAutoSeggesting}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
