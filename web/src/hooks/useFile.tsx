import { UploadOptions, UploadResponse } from "@/features/media/server/action";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { goClientApi } from "@/lib/go-api/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
type FileUploadProps = {
  successMsg?: boolean;
  onSucessAction?: (data: UploadedFileMeta[], variables: UploadOptions) => void;
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
    mutationFn: async ({ files, scope, url, extraBody }: UploadOptions) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("scope", scope);

      if (extraBody) {
        Object.entries(extraBody).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }
      const res = await goClientApi.request<UploadResponse>(url, {
        method: "POST",
        body: formData,
      });

      if (res.error || !res.data) {
        throw new Error(res.error || "failed to upload");
      }
      const response = res.data;

      if (response.failed_files && response.failed_files.length > 0) {
        response.failed_files.forEach((failedFile) => {
          toast.error(
            `${failedFile.file.fileName} failed : ${failedFile.error}`,
            { id: failedFile.file.fileName },
          );
        });
      }
      return response.uploaded_files;
    },
    onSuccess: onSucessAction
      ? (data: UploadedFileMeta[], variables: UploadOptions) =>
          onSucessAction(data, variables)
      : (uploadedFiles, variables) => {
          const successFiles = uploadedFiles ? uploadedFiles.length : 0;
          const failedCount = variables.files.length - successFiles;

          if (successMsg && uploadedFiles && uploadedFiles.length > 0) {
            toast.success(
              `${uploadedFiles.length} uploaded / ${failedCount} failed`,
              {
                id: "file-upload",
              },
            );
          }
        },
    onError: (error) => {
      toast.error(`uploaded Process Failed To Start: ${error.message}`, {
        id: "file-upload",
      });
    },
  });

  return {
    uploadMutate,
    isUploading,
    uploadedFilesData,
    uploadError,
  };
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
  },
>(type: DeleteMediaEndpointScope) {
  return useMutation({
    mutationFn: async (args: Args) => {
      switch (type) {
        case "draft_task":
          await fetch(
            `/api/media/tasks/draft?key=${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            },
          );
          break;
        case "mentorship_chat":
          await fetch(
            `/api/media/mentorship?key=${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            },
          );
          break;
        case "solution_workspace":
          await fetch(
            `/api/media/solutions?key=${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            },
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
      const res = await goClientApi.request<Blob>(
        `/media/download?key=${encodeURIComponent(key)}`,
        {
          method: "GET",
          headers: {},
        },
        "blob",
      );
      if (res.error || !res.data) throw new Error("Failed to download file");

      return { blob: res.data, fileName };
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

      const res = await goClientApi.request<string>(
        `/media?key=${encodeURIComponent(key)}`,
        {
          method: "GET",
          cache: "no-store",
        },
        "text",
      );

      if (res.error || !res.data) {
        throw new Error(
          `Failed to fetch file content: ${res.error || res.status}`,
        );
      }
      const content = res.data;

      return content;
    },
  });
}
