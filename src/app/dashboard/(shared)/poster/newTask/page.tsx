"use client";
import { Button } from "@/components/ui/button";
import TaskPostingEditor from "@/features/tasks/components/Tiptap";
import { FormEvent, Suspense, useState } from "react";
import { toast } from "sonner";
import Loading from "../../loading";

export default function NewTaskpage() {
  const [content, setContent] = useState<string>("");
  const handleSave = () => {
    console.log("Content to save:", content);
    toast.success(`Saved ${content}`);
    const imageUrls = Array.from(
      content.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)
    ).map(([, src]) => src);

    console.log("Extracted image URLs:", imageUrls);
    imageUrls.forEach(imgeUrl => {
      toast.success(`Saved ${imgeUrl} `);
      console.log(imgeUrl)
    });
  };
  const onChange = (e: string) => {
    setContent(e);
    console.log(e);
  };
  return (
    <div className="mx-auto flex flex-col h-full">
      <div className="max-w-5xl mx-auto mt-8 px-6">
        <h2 className="text-2xl font-semibold">Post a Task</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Describe the task clearly so students can understand and solve it
          effectively.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 flex-1">
        <Suspense fallback={<Loading />}>
          <TaskPostingEditor content={content} onChange={onChange} />
        </Suspense>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSave}>Save Task</Button>
        </div>
      </div>
    </div>
  );
}
