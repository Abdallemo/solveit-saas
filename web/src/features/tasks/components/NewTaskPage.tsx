"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { NewuseTask } from "@/contexts/TaskContext";
import {
  autoSuggestTasWithAi,
  validateContentWithAi,
} from "@/features/Ai/server/action";
//import MediaPreviewer from "@/features/media/components/MediaPreviewer";
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
import { useAutoSave, useDebouncedCallback } from "@/hooks/useAutoDraftSave";
import useCurrentUser from "@/hooks/useCurrentUser";
import { calculateEditorTextLength } from "@/lib/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Editor } from "@tiptap/react";
import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
//import PostingEditor from "./richTextEdito/MainTiptapEditor";
import { CustomeTextSerializersForAi } from "./richTextEdito/tiptap-ai-content-selized";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MediaPreviewer = dynamic(
  () => import("@/features/media/components/MediaPreviewer"),
  {
    ssr: false,
  },
);
const PostingEditor = dynamic(
  () => import("@/features/tasks/components/richTextEdito/MainTiptapEditor"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-172.5 md:h-175 lg:h-195" />,
  },
);

export default function TaskCreationPage({
  defaultValues,
}: {
  defaultValues: TaskSchema;
}) {
  const { draft, updateDraft, filePreview, setFilePreview } = NewuseTask(); //new Migrations
  const {
    category,
    content,
    deadline,
    description,
    price,
    title,
    visibility,
    contentText,
  } = draft;
  const currentUser = useCurrentUser();
  const { user } = currentUser;
  const [isDisabled, setIsDisabled] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const { mutateAsync: validateContent, isPending } = useMutation({
    mutationFn: validateContentWithAi,
    onMutate: () => {
      toast.loading("checking content againt our rules....", { id: "openai" });
    },
    onSuccess: ({ violatesRules, error }) => {
      if (error) {
        toast.error(error.message, { id: "openai" });
        return;
      }
      if (violatesRules) {
        toast.warning(
          <div className="flex flex-col gap-2">
            <span className="font-semibold">
              Your task violates our posting rules. Try again.
            </span>
            <span>
              If you believe this is a mistake, reach out to our support team.
            </span>
          </div>,

          { id: "openai" },
        );
        return;
      }
      toast.success("valid content", {
        id: "openai",
      });
    },
    onError: (er) => {
      toast.error(er.message, { id: "openai" });
    },
  });
  const { mutateAsync: autoSuggest, isPending: isAutoSeggesting } = useMutation(
    {
      mutationFn: autoSuggestTasWithAi,
      onSuccess: ({ category, description, price, title, error }) => {
        if (error) {
          toast.error(error.message, { id: "openai-suggestion" });
          return;
        }
        updateDraft({
          category,
          description,
          price,
          title,
        });
        form.reset({
          title,
          description,
          category,
          price,
          content: draft.content,
        });
      },
    },
  );
  async function handleSugestions() {
    await autoSuggest({
      content: contentText,
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const textLength = calculateEditorTextLength(content);
    setIsDisabled(textLength <= MIN_CONTENT_LENGTH);
  }, [content]);

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
    ],
    delay: 250,
  });

  const handleEditorChange = useDebouncedCallback(
    (editor: Editor) => {
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
    },
    200,
    [updateDraft, form],
  );

  async function onSubmit(data: TaskSchema) {
    try {
      await validateContent({
        content: contentText,
        adminMode: false,
      });

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
    console.warn("Validation errors ", errors);
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
        <div className="">
          <h1 className="text-2xl font-semibold">Post a Task</h1>
          <p className="text-sm text-muted-foreground">
            Describe the task clearly so students can understand and solve it
            effectively.
          </p>
        </div>

        <Button
          type="submit"
          form="task-form"
          disabled={isDisabled || isPending || isAutoSeggesting}
          className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-35"
        >
          Publish Task
        </Button>
      </header>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          id="task-form"
          className="flex flex-col flex-1 "
        >
          <div className="flex h-full">
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
