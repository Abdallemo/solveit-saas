"use client"
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import TaskPostingEditor from "./richTextEdito/Tiptap";
import NewTaskSidebar from "./newTaskSidebar";
import { useTask } from "@/contexts/TaskContext";

export default function TaskCreationPage() {
  const {content,} = useTask()
  const form = useForm({
  defaultValues: {
    deadline: "",
    visibility: "public",
    category: "",
    price: 10,
    content: content ?? "",
  },
});
  return (
    <div className="flex h-full bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Post a Task</h1>
          <Button type="submit" form="task-form" >Publish Task</Button>
        </header>
        <FormProvider {...form}>
        <form id="task-form" action="" className="flex-1 flex overflow-hidden">
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
