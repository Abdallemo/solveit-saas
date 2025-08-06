import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFiles } from "@/features/media/server/action";
import { deleteFileFromWorkspace } from "@/features/tasks/server/action";

export function useFileUpload() {
  const {
    mutateAsync: uploadMutate,
    isPending: isUploading,
    data: uploadedFilesData,
    error: uploadError,
  } = useMutation({
    mutationFn: uploadFiles,
    onSuccess: () => {
      toast.success("Files uploaded successfully!", { id: "file-upload" });
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
