"use client";
import { Suspense, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import TaskPostingEditor from "./richTextEdito/Tiptap";
import NewTaskSidebar from "./newTaskSidebar";
import { useTask } from "@/contexts/TaskContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema, taskSchema } from "../server/task-types";
import {
  getPresignedUploadUrl,
  UploadedFileMeta,
} from "@/features/media/server/action";
import {
  autoSaveDraftTask,
  createTaksPaymentCheckoutSession,
} from "../server/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleAlert, Loader } from "lucide-react";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function TaskCreationPage() {
  const {
    category,
    deadline,
    price,
    visibility,
    content,
    selectedFiles,
    description,
    title,
  } = useTask();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const doc = new DOMParser().parseFromString(content, "text/html");
  const textContent = doc.body.textContent || "";

  async function uploadSelectedFiles(selectedFiles: File[], state?: boolean) {
    const uploadedFileMeta: UploadedFileMeta[] = [];
    for (const file of selectedFiles) {
      const presigned = await getPresignedUploadUrl(file.name, file.type);
      await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      uploadedFileMeta.push({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: presigned.filePath,
        storageLocation: presigned.publicUrl,
      });
    }
    return JSON.stringify(uploadedFileMeta);
  }
  const isDisabled = textContent.trim().length < 5;

  const defaultValues = useMemo(
    () => ({
      title,
      description,
      content,
      deadline,
      visibility,
      category,
      price,
    }),
    [title, description, content, deadline, visibility, category, price]
  );

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const currentUser = useCurrentUser();
  const { user } = currentUser;

  async function onSubmit(data: TaskSchema) {
    try {
      setIsUploading(true);
      const uploadedFiles = await uploadSelectedFiles(selectedFiles);

      await autoSaveDraftTask(
        title,
        description,
        content,
        user?.id!,
        category,
        price,
        visibility,
        deadline,
        uploadedFiles
      );
      setIsUploading(false);

      const url = await createTaksPaymentCheckoutSession(price);
      router.push(url!);
    } catch (e) {
      console.error(e);
      toast.error(`${(<CircleAlert />)}something Went Wrong`);
    }
  }
  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Post a Task</h1>
          <Button
            type="submit"
            form="task-form"
            disabled={isDisabled || isUploading}
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
            onSubmit={form.handleSubmit(onSubmit)}
            id="task-form"
            className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 pb-2">
                <p className="text-sm text-muted-foreground">
                  Describe the task clearly so students can understand and solve
                  it effectively.
                </p>
              </div>
              <div className="flex-1 overflow-auto p-4 pt-0">
                <Suspense>
                  <TaskPostingEditor />
                </Suspense>
              </div>
            </div>
            <NewTaskSidebar />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
