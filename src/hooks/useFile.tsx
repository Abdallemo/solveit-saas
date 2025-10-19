import { env } from "@/env/client";
import { uploadFiles } from "@/features/media/server/action";
import { deleteFileFromWorkspace } from "@/features/tasks/server/action";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
type FileUploadProps = {
  successMsg?: boolean;
  onSucessAction?: () => void;
};
export function useFileUpload({
  onSucessAction,
  successMsg = true,
}: FileUploadProps) {
  const {
    mutateAsync: uploadMutate,
    isPending: isUploading,
    data: uploadedFilesData,
    error: uploadError,
  } = useMutation({
    mutationFn: uploadFiles,
    onSuccess: onSucessAction
      ? () => onSucessAction()
      : () => {
          if (successMsg) {
            toast.success("Files uploaded successfully!", {
              id: "file-upload",
            });
          }
        },
    onError: (error) => {
      toast.error(`File upload failed: ${error.message}`, {
        id: "file-upload",
      });
    },
  });

  return { uploadMutate, isUploading, uploadedFilesData, uploadError };
}
export function useDeleteFile() {
  return useMutation({
    mutationFn: async ({
      fileId,
      filePath,
    }: {
      fileId: string;
      filePath: string;
    }) => {
      return await deleteFileFromWorkspace(fileId);
    },
    onSuccess: () => {
      toast.success("File deleted successfully!", { id: "file-delete" });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete file: ${error.message}`, {
        id: "file-delete",
      });
    },
  });
}
export function useDownloadFile() {
  return useMutation({
    mutationFn: async ({
      key,
      fileName,
    }: {
      key: string;
      fileName: string;
    }) => {
      const res = await fetch(
        `${env.NEXT_PUBLIC_URL}/api/download-proxy?key=${encodeURIComponent(
          key
        )}`
      );
      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();

      return { blob, fileName };
    },

    onSuccess: ({ blob, fileName }) => {
      toast.success("File ready to download", {
        id: `file-${fileName}-download`,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (error, { fileName }) => {
      toast.error(`Failed to download file: ${error.message}`, {
        id: `file-${fileName}-download`,
      });
    },
  });
}
