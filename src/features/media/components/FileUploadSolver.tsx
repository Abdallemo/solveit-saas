"use client";

import Loading from "@/app/loading";
import { AuthGate } from "@/components/GateComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { env } from "@/env/client";
import { saveFileToWorkspaceDB } from "@/features/tasks/server/action";
import { useAuthGate } from "@/hooks/useAuthGate";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useDeleteFile, useDownloadFile, useFileUpload } from "@/hooks/useFile";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadedFileMeta } from "../server/media-types";
import { FileChatCardComps } from "./FileHelpers";
import MediaPreviewer from "./MediaPreviewer";

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
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<UploadedFileMeta | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadMutate, isUploading } = useFileUpload({});
  const { mutateAsync: downloadFile, isPending: isRequestingDownload } =
    useDownloadFile();
  const handleFileDownload = async (key: string, fileName: string) => {
    toast.loading("preparing file downlad..", {
      id: `file-${fileName}-download`,
    });
    await downloadFile({ fileName, key });
  };
  const {
    mutateAsync: deleteFile,
    isPending: isDeleting,
    isError,
  } = useDeleteFile();
  if (isLoading) return <Loading />;
  if (isBlocked) return <AuthGate />;
  const fileDisabled =
    currentWorkspace?.task.status === "SUBMITTED" ||
    currentWorkspace?.task.status === "COMPLETED";
  const uploadedById = useCurrentSolver.user?.id!;
  const fileLimitReached = uploadedFiles.length >= maxFiles;

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || fileDisabled) return;

    const fileArray = Array.from(newFiles).slice(
      0,
      maxFiles - uploadedFiles.length
    );

    for (const file of fileArray) {
      try {
        toast.loading("uploading..", { id: "file-upload" });
        const [uploadedMeta]: UploadedFileMeta[] = await uploadMutate({
          files: [file],
          scope: "workspace",
          url: `${env.NEXT_PUBLIC_GO_API_URL}/media`,
        });

        setUploadingFiles((prev) => [...prev, file]);
        toast.dismiss("file-upload");

        const savedFile = await saveFileToWorkspaceDB({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          filePath: uploadedMeta.filePath,
          storageLocation: uploadedMeta.storageLocation,
          workspaceId: currentWorkspace?.id!,
          isDraft: true,
          uploadedById,
        });

        setUploadedFiles((prev) => [...prev, savedFile!]);

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

  return (
    <div className={cn("w-full", className)}>
      <MediaPreviewer
        fileRecords={uploadedFiles}
        filePreview={filePreview}
        onClose={() => {
          setFilePreview(null);
        }}
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
          disabled={fileLimitReached || fileDisabled}
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
            disabled={fileLimitReached || fileDisabled}
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => inputRef.current?.click()}>
            Select Files
          </Button>
        </div>
      </div>

      {(uploadingFiles.length > 0 || uploadedFiles.length > 0) && (
        <ScrollArea className="flex-1 ">
          <div className="mt-2 space-y-2 h-[100px] overflow-scroll p-2 ">
            {uploadingFiles.map((file) => (
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
            ))}
            {uploadedFiles.map((file) => (
              <div key={file.id} className="w-70">
                <FileChatCardComps
                  action={() => {
                    console.log("Opening preview for:", file.fileName);
                    setFilePreview({
                      fileName: file.fileName,
                      filePath: file.filePath,
                      fileSize: file.fileSize,
                      fileType: file.fileType,
                      storageLocation: file.storageLocation,
                    });
                  }}
                  key={file.id}
                  file={file}
                  deleteAction={async () => {
                    try {
                      toast.loading("deleting", { id: "file-delete" });
                      await deleteFile({
                        fileId: file.id,
                        filePath: file.storageLocation,
                      });
                      setUploadedFiles((prev) =>
                        prev.filter((f) => f.filePath !== file.filePath)
                      );
                    } catch (error) {}
                  }}
                  downloadAction={async (file) => {
                    await handleFileDownload(file.filePath, file.fileName);
                  }}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
