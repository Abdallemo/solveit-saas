"use client";

import React, { Suspense, useState } from "react";
import { CategorySelectWrapper } from "./CategorySelectWrapper";
import { SubmitButtonWithStatus } from "./SubmitButtonWithState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createTaskAction } from "../server/action";
import {
  getPresignedUploadUrl,
  UploadedFileMeta,
} from "@/features/media/server/action";
import { Loader2Icon } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
type taskFomrProps = {
  taskContent: string;
  taskTitle: string;
  taskDescription: string;
  selectedFiles: File[];
};
export function NewTaskForm({
  taskContent,
  taskTitle,
  taskDescription,
  selectedFiles,
}: taskFomrProps) {
  const [filebeignUploaded, setFilebeignUploaded] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("taskContent", taskContent);
    formData.append("title", taskTitle);
    formData.append("description", taskDescription);

    const uploadedFileMeta: UploadedFileMeta[] = [];

    for (const file of selectedFiles) {
      const presigned = await getPresignedUploadUrl(file.name, file.type);
      setFilebeignUploaded(true);
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

    formData.append("uploadedFiles", JSON.stringify(uploadedFileMeta));
    setFilebeignUploaded(false);

    const res = await createTaskAction(formData);
    toast.success("succefuly published your task");
    router.push("/dashboard/poster/yourTasks");
  }

  return (
    <form onSubmit={handleSubmit} className="w-2/3 space-y-6">
      <div>
        <Label>Deadline</Label>
        <Select name="deadline" required>
          <SelectTrigger>
            <SelectValue placeholder="Select time task takes to be completed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24h</SelectItem>
            <SelectItem value="48h">48h</SelectItem>
            <SelectItem value="3days">3 days</SelectItem>
            <SelectItem value="7days">7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Visibility</Label>
        <Select name="visibility" required>
          <SelectTrigger>
            <SelectValue placeholder="Choose task visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Category</Label>
        <Suspense fallback={<SelectLoadingSkeleton />}>
          <CategorySelectWrapper />
        </Suspense>
      </div>

      <div>
        <Label>Price</Label>
        <Input
          type="number"
          name="price"
          min={10}
          placeholder="Price"
          required
        />
      </div>
      
      {filebeignUploaded && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2Icon className="animate-spin w-4 h-4" />
          Uploading files...
        </div>
      )}
      <SubmitButtonWithStatus />
    </form>
  );
}

function SelectLoadingSkeleton() {
  return (
    <Select disabled>
      <SelectTrigger>
        <SelectValue placeholder="Loading categories..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="" disabled>
          <Loader2Icon className="animate-spin " />
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
