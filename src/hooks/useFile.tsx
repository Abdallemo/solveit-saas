import { uploadFiles } from "@/features/media/server/action";
import { useMutation, useQuery } from "@tanstack/react-query";
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

type DeleteMediaEndpointScope =
  | "draft_task"
  | "task"
  | "solution_workspace"
  | "mentorship_chat"
  | "generic";
export function useDeleteFileGeneric<
  Args extends Record<string, any> & {
    filePath: string;
  }
>(type: DeleteMediaEndpointScope) {
  return useMutation({
    mutationFn: async (args: Args) => {
      switch (type) {
        case "draft_task":
          await fetch(
            `/api/media/tasks/draft?key=${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            }
          );
          break;
        case "mentorship_chat":
          await fetch(
            `/api/media/mentorship?key=${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            }
          );
          break;
        case "solution_workspace":
          await fetch(
            `/api/media/solutions?key=${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            }
          );
          break;
        case "task":
          /**
           * Not Yet Needed
           */
          break;
        case "generic":
          await fetch(`/api/media?key=${encodeURIComponent(args.filePath)}`, {
            method: "DELETE",
          });
          break;
      }
    },
    onMutate: ({ filePath }) => {
      toast.loading("deleting..", {
        id: `delete-file-${filePath}`,
      });
    },
    onSuccess: (_data, { filePath }) => {
      toast.success("File deleted successfully!", {
        id: `delete-file-${filePath}`,
      });
    },
    onError: (error: any, { filePath }) => {
      toast.error(`Failed to delete file: ${error.message}`, {
        id: `delete-file-${filePath}`,
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
        `/api/media/download-proxy?key=${encodeURIComponent(key)}`
      );
      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();

      return { blob, fileName };
    },
    onMutate: ({ fileName, key }) => {
      toast.loading("preparing to downlad..", {
        id: `file-${fileName}-download`,
      });
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
type FileContent = string;
export function useFileStream(key: string | null) {
  return useQuery<FileContent, Error>({
    queryKey: ["fileContent", key],

    enabled: !!key,

    queryFn: async () => {
      if (!key) {
        throw new Error("Key is required for fetching file content.");
      }

      const res = await fetch(`/api/media?key=${encodeURIComponent(key)}`, {
        method: "GET",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to fetch file content: ${errorText || res.statusText}`
        );
      }
      const content = await res.text();

      return content;
    },
  });
}
