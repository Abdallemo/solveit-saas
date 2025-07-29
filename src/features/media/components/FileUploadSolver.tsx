"use client";

import { useRef, useState } from "react";
import { Upload, X, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  deleteFileFromWorkspace,
  saveFileToWorkspaceDB,
} from "@/features/tasks/server/action";
import useCurrentUser from "@/hooks/useCurrentUser";
import { getPresignedUploadUrl } from "../server/action";
import AuthGate from "@/components/AuthGate";
import { useFileUploadWithProgress } from "@/hooks/useFileUploadWithProgress";
import { Progress } from "@/components/ui/progress";
import Loading from "@/app/loading";
import { useAuthGate } from "@/hooks/useAuthGate";

interface FileUploadProps {
  maxFiles?: number;
  className?: string;
}

export default function FileUploadSolver({
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const useCurrentSolver = useCurrentUser();
  const { isLoading, isBlocked } = useAuthGate();
  const { uploadedFiles, setUploadedFiles, currentWorkspace } = useWorkspace();
  const { uploadFile, progress } = useFileUploadWithProgress();
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  if (isLoading) return <Loading />;
  if (isBlocked) return <AuthGate />;

  const uploadedById = useCurrentSolver.user?.id!;
  const fileLimitReached = uploadedFiles.length >= maxFiles;

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles).slice(
      0,
      maxFiles - uploadedFiles.length
    );

    for (const file of fileArray) {
      setUploadingFiles((prev) => [...prev, file]);
      try {
        const presigned = await getPresignedUploadUrl(
          file.name,
          file.type,
          "workspace"
        );

        await uploadFile(file, presigned.uploadUrl);

        const savedFile = await saveFileToWorkspaceDB({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          filePath: presigned.filePath,
          storageLocation: presigned.publicUrl,
          workspaceId: currentWorkspace?.id!,
          isDraft: true,
          uploadedById,
        });

        setUploadedFiles((prev) => [...prev, savedFile]);

        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
        }, 100);

        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    inputRef.current!.value = "";
  };

  const removeFile = async (fileId: string, filePath: string) => {
    const updated = uploadedFiles.filter((f) => f.filePath !== filePath);
    const { success, error, file } = await deleteFileFromWorkspace(fileId);
    if (success) toast.success(success);
    if (error) toast.error(error);
    setUploadedFiles(updated);
  };

  return (
    <div className={cn("w-full", className)}>
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
          disabled={fileLimitReached}
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="p-2 rounded-full bg-muted">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium">
            Drop files here or click to browse
          </div>
          <div className="text-xs text-muted-foreground">
            PDF, DOC, JPG, PNG up to 200MB • {uploadedFiles.length}/{maxFiles}{" "}
            files
          </div>
          <Button
            type="button"
            disabled={fileLimitReached}
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => inputRef.current?.click()}>
            Select Files
          </Button>
        </div>
      </div>

      {(uploadingFiles.length > 0 || uploadedFiles.length > 0) && (
        <ScrollArea className="flex-1">
          <div className="mt-2 space-y-2 h-[100px] overflow-scroll p-2">
            {uploadingFiles.map((file) => (
              <div
                key={`uploading-${file.name}`}
                className="flex items-center gap-3 p-2 bg-muted rounded-md">
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {file.name}
                  </div>
                  <Progress value={progress[file.name] ?? 0} />
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}

            {uploadedFiles.map((file) => (
              <div
                key={file.filePath}
                className="flex items-center gap-1 p-1 bg-muted rounded-md">
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <a
                    href={file.storageLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium truncate underline text-primary">
                    {file.fileName}
                  </a>
                  <Progress value={progress[file.fileName] ?? 100} />
                  <p className="text-xs text-muted-foreground">
                    {(file.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => removeFile(file.id, file.filePath)}
                  className="h-6 w-6 p-0 cursor-pointer">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
