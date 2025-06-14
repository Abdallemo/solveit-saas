"use client";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
} from "react-hook-form";
import TaskPostingEditor from "./richTextEdito/Tiptap";
import NewTaskSidebar from "./newTaskSidebar";
import { useTask } from "@/contexts/TaskContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema, taskSchema } from "../server/task-types";
import { uploadSelectedFiles } from "@/features/media/server/action";
import {
  autoSaveDraftTask,
  createTaksPaymentCheckoutSession,
} from "../server/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import useCurrentUser from "@/hooks/useCurrentUser";
import { generateTitleAndDescription } from "../lib/utils";

export default function TaskCreationPage() {
  const { category, deadline, price, visibility, content, selectedFiles } =
    useTask();
  const router = useRouter();
  const {isDisabled} = generateTitleAndDescription(content)
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      deadline: deadline,
      visibility: visibility,
      category: category,
      price: price,
      content: content,
    },
  });
  const currentUser = useCurrentUser();
  if (!currentUser) return;
  const {user} = currentUser

  async function onSubmit(data: TaskSchema) {
    try {
      console.log(data);
      const uploadedFiles = await uploadSelectedFiles(selectedFiles);

      await autoSaveDraftTask(
        content,
        user?.id!,
        category,
        price,
        visibility,
        deadline,
        uploadedFiles

      );

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
          <Button type="submit" form="task-form" disabled={isDisabled}>
            Publish Task
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
