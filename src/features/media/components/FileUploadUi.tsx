"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewuseTask } from "@/contexts/TaskContext";
import { env } from "@/env/client";
import { deleteDraftFile, saveDraftTask } from "@/features/tasks/server/action";
import {
  useDeleteFileGeneric,
  useDownloadFile,
  useFileUpload,
} from "@/hooks/useFile";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UploadedFileMeta } from "../server/media-types";
import { FileChatCardComps } from "./FileHelpers";
import MediaPreviewer from "./MediaPreviewer";

interface FileUploadUiProps {
  maxFiles?: number;
  className?: string;
}

export default function FileUploadUi({
  className,
}: FileUploadUiProps) {
  const { updateDraft, draft } = NewuseTask();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<UploadedFileMeta | null>(null);
  const {
    category,
    content,
    deadline,
    description,
    price,
    title,
    visibility,
    userId,
  } = draft;

  const { uploadMutate } = useFileUpload({});

  const { mutateAsync: deleteFile } = useDeleteFileGeneric(deleteDraftFile);
  const { mutateAsync: downloadFile } = useDownloadFile();

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;
    const fileArray = Array.from(newFiles);
    const uploadedMetas: UploadedFileMeta[] = [];
    setUploadingFiles(() => [...fileArray]);

    for (const file of fileArray) {
      try {
        toast.loading("Uploading...", { id: "file-upload" });
        const [uploadedMeta] = await uploadMutate({
          files: [file],
          scope: "task",
          url: `${env.NEXT_PUBLIC_GO_API_URL}/media`,
        });

        uploadedMetas.push(uploadedMeta);

        setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    const newUploadedFiles = [...(draft.uploadedFiles || []), ...uploadedMetas];
    updateDraft({ uploadedFiles: newUploadedFiles });

    await saveDraftTask(
      title,
      description,
      content,
      userId,
      category,
      price,
      visibility,
      deadline,
      newUploadedFiles
    );

    inputRef.current!.value = "";
    setUploadingFiles([]);
  };

  const handleFileDelete = async (filePath: string) => {
    try {
      toast.loading("Deleting...", { id: `delete-file-${filePath}` });
      await deleteFile({
        filePath,
        userId,
      });
      const filtered = (draft.uploadedFiles || []).filter(
        (f) => f.filePath !== filePath
      );
      updateDraft({ uploadedFiles: filtered });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file");
    }
  };

  const handleFileDownload = async (fileName: string, key: string) => {
    toast.loading("Preparing download...", {
      id: `file-${fileName}-download`,
    });
    await downloadFile({ fileName, key });
  };

  return (
    <div className={cn("w-full", className)}>
      <MediaPreviewer
        fileRecords={draft.uploadedFiles || []}
        filePreview={filePreview}
        onClose={() => setFilePreview(null)}
      />

      <div
        className={cn(
          "border-2 border-dashed rounded-md p-4 text-center",
          isDragging ? "border-primary bg-primary/5" : "border-muted"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}>
        <Input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium">
            Drop files here or click to browse
          </div>
          <div className="text-xs text-muted-foreground">
            PDF, DOC, JPG, PNG up to 50MB • {draft.uploadedFiles?.length || 0}{" "}
            files
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => inputRef.current?.click()}>
            Select Files
          </Button>
        </div>
      </div>

      {(uploadingFiles.length > 0 ||
        (draft.uploadedFiles?.length ?? 0) > 0) && (
        <ScrollArea className="flex-1">
          <div className="space-y-2 h-[200px] overflow-scroll p-2 ">
            {uploadingFiles.map((file) => (
              <div key={file.name} className="w-58">
                <FileChatCardComps
                  key={file.name}
                  loading
                  file={{
                    fileName: file.name,
                    filePath: "",
                    fileSize: file.size,
                    fileType: file.type,
                    storageLocation: "",
                  }}
                />
              </div>
            ))}
            {(draft.uploadedFiles || []).map((file) => (
              <div key={file.filePath} className="w-58">
                <FileChatCardComps
                  file={file}
                  action={() =>
                    setFilePreview({
                      fileName: file.fileName,
                      filePath: file.filePath,
                      fileSize: file.fileSize,
                      fileType: file.fileType,
                      storageLocation: file.storageLocation,
                    })
                  }
                  deleteAction={async (f) => {
                    await handleFileDelete(f.filePath);
                  }}
                  downloadAction={async (f) =>
                    await handleFileDownload(f.fileName, f.filePath)
                  }
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
