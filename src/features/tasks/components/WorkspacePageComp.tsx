"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import TaskPostingEditor from "./richTextEdito/Tiptap";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema, taskSchema } from "../server/task-types";
import {
  getPresignedUploadUrl,
  UploadedFileMeta,
} from "@/features/media/server/action";
import { WorkpaceSchemReturnedType } from "../server/action";
import { toast } from "sonner";
import { CircleAlert, Loader } from "lucide-react";
import WorkspaceSidebar from "./richTextEdito/WorkspaceSidebar";
import WorkspaceEditor from "./richTextEdito/workspace/Tiptap";

type WorkspaceProp = Partial<
  Pick<NonNullable<WorkpaceSchemReturnedType>, "content">
>;
export default function WorkspacePageComp({
  defaultValues,
}: {
  defaultValues: WorkspaceProp;
}) {
  const content = defaultValues.content!;
  const [isUploading, setIsUploading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const doc = new DOMParser().parseFromString(content!, "text/html");
    const text = doc.body.textContent?.trim() || "";

    setIsDisabled(text.length < 5);
  }, [content]);

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

  const form = useForm<TaskSchema>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    form.reset({
      content,
    });
  }, [form, content]);

  async function onSubmit(data: TaskSchema) {
    toast.success("Solution Uploaded successfully")
    try {
      setIsUploading(true);
      setIsUploading(false);
    } catch (e) {
      console.error(e);
      toast.error(`${(<CircleAlert />)}something Went Wrong`);
    }
  }
  console.log(content);
  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Solution Workspace</h1>
          <Button
            // type="submit"
            form="solution-form"
            disabled={isDisabled || isUploading}
            className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-[140px]" onClick={()=>toast.success("Solution Uploaded successfully")}>
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
            onSubmit={form.handleSubmit(onSubmit)}
            id="solution-form"
            className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 pb-2">
                <p className="text-sm text-muted-foreground">
                  answer with in time
                </p>
              </div>
              <div className="flex-1 overflow-auto p-4 pt-0">
                <Suspense>
                  <WorkspaceEditor />
                </Suspense>
              </div>
            </div>
            <WorkspaceSidebar />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
