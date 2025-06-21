"use client";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkpaceSchem, WorkpaceSchemType } from "../server/task-types";
import { toast } from "sonner";
import { CircleAlert, Loader } from "lucide-react";
import WorkspaceSidebar from "./richTextEdito/WorkspaceSidebar";
import WorkspaceEditor from "./richTextEdito/workspace/Tiptap";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Progress } from "@/components/ui/progress";


export default function WorkspacePageComp() {
  const [isUploading, setIsUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date(Date.now()));
  const [isDisabled, setIsDisabled] = useState(true);
  const { content } = useWorkspace();
  const [progress] = useState(65);

  const formattedDateTime =
    currentTime.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }) +
    " " +
    currentTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
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
  console.log(content);
  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
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
            onSubmit={form.handleSubmit(onSubmit)}
            id="solution-form"
            className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 pb-2  flex justify-between items-center">
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>My Website's Contact Form Broke! (Coding Help)</span>
                    <span>{progress}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
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
