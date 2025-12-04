"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { env } from "@/env/client";
import { saveFileToWorkspaceDB } from "@/features/tasks/server/action";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  useDeleteFileGeneric,
  useDownloadFile,
  useFileUpload,
} from "@/hooks/useFile";
import { cn } from "@/lib/utils/utils";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileChatCardComps } from "./FileHelpers";

interface FileUploadProps {
  className?: string;
}

export default function FileUploadSolver({ className }: FileUploadProps) {
  const useCurrentSolver = useCurrentUser();

  const { uploadedFiles, setUploadedFiles, currentWorkspace, setFilePreview } =
    useWorkspace();
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
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
  } = useDeleteFileGeneric("solution_workspace");

  const fileDisabled =
    currentWorkspace?.task.status === "SUBMITTED" ||
    currentWorkspace?.task.status === "COMPLETED";
  const uploadedById = useCurrentSolver.user?.id!;

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || fileDisabled) {
      return;
    }

    const fileArray = Array.from(newFiles);

    for (const file of fileArray) {
      console.log("in the for loop");
      try {
        toast.loading("uploading..", { id: "file-upload" });
        const [uploadedMeta] = await uploadMutate({
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
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-4 text-center",
          isDragging ? "border-primary bg-primary/5" : "border-muted",
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
        }}
      >
        <Input
          disabled={fileDisabled}
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
            PDF, DOC, JPG, PNG up to 200MB • {uploadedFiles.length} files
          </div>
          <Button
            type="button"
            disabled={fileDisabled}
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => inputRef.current?.click()}
          >
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
                      await deleteFile({
                        filePath: file.filePath,
                      });
                      setUploadedFiles((prev) =>
                        prev.filter((f) => f.filePath !== file.filePath),
                      );
                    } catch (error) {}
                  }}
                  downloadAction={async (file) => {
                    await handleFileDownload(file.filePath, file.fileName);
                  }}
                  opt={{ deleteDisable: fileDisabled }}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
