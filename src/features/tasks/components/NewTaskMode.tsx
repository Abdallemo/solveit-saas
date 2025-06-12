"use Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewTaskForm } from "./NewTaskForm";
import { useTask } from "@/contexts/TaskContext";
import { useState } from "react";
import { truncateText } from "@/lib/utils";

export default function NewTaskModel() {
  const { content, selectedFiles } = useTask();
  const doc = new DOMParser().parseFromString(content, "text/html");
  const [onopen, setOnOpen] = useState(false);
  const textContent = doc.body.textContent || "";
  const isDisabled = textContent.trim().length < 5;

  const titleEl = doc.querySelector("h1, h2, p");
  const rawTitle = titleEl?.textContent?.trim() || "";
  const title = truncateText(rawTitle, 80);

  let description = "";
  const paragraphs = doc.querySelectorAll("p");
  for (const p of paragraphs) {
    const text = p.textContent?.trim() || "";
    if (text && text !== title) {
      description = truncateText(text, 160);
      break;
    }
  }

  return (
    <Dialog onOpenChange={setOnOpen}>
      <DialogTrigger asChild disabled={isDisabled}>
        <Button>Procceed Publishing</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <NewTaskForm
          selectedFiles={selectedFiles}
          taskContent={content}
          taskDescription={description}
          taskTitle={title}
        />
      </DialogContent>
    </Dialog>
  );
}
