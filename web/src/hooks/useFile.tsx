import { UploadOptions, UploadResponse } from "@/features/media/media-types";
import { UploadedFileMeta } from "@/features/media/media-types";
import { goApiClient } from "@/lib/go-api/client";
import { Time } from "@/lib/utils/date-time";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
type FileUploadProps<T> = {
  successMsg?: boolean;
  onSucessAction?: (data: T, variables: UploadOptions) => void;
};

export function useFileUpload<T = UploadedFileMeta[]>({
  onSucessAction,
  successMsg = true,
}: FileUploadProps<T>) {
  const {
    mutateAsync: uploadMutate,
    isPending: isUploading,
    data: uploadedFilesData,
    error: uploadError,
  } = useMutation({
    mutationFn: async ({ files, url, extraBody }: UploadOptions) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      if (extraBody) {
        Object.entries(extraBody).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const res = await goApiClient.request<T>(url, {
        method: "POST",
        body: formData,
      });

      if (res.error || !res.data) {
        throw new Error(res.error || "failed to upload");
      }

      const data = res.data;

      const isStandardResponse = (val: any): val is UploadResponse => {
        return val && "uploadedFiles" in val && "failedFiles" in val;
      };

      if (isStandardResponse(data)) {
        if (data.failedFiles && data.failedFiles.length > 0) {
          data.failedFiles.forEach((failedFile) => {
            toast.error(
              `${failedFile.file.fileName} failed: ${failedFile.error}`,
              { id: failedFile.file.fileName },
            );
          });
        }
        return data.uploadedFiles as unknown as T;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      if (onSucessAction) {
        return onSucessAction(data, variables);
      }

      if (successMsg) {
        if (Array.isArray(data)) {
          const successFiles = data.length;
          const failedCount = variables.files.length - successFiles;

          if (successFiles > 0) {
            toast.success(`${successFiles} uploaded / ${failedCount} failed`, {
              id: "file-upload",
            });
          }
        } else {
          toast.success("Upload successful", { id: "file-upload" });
        }
      }
    },
    onError: (error) => {
      toast.error(`Upload Process Failed: ${error.message}`, {
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
  | "editor";
export function useDeleteFileGeneric<
  Args extends Record<string, any> & {
    filePath: string;
  },
>(type: DeleteMediaEndpointScope) {
  return useMutation({
    mutationFn: async (args: Args) => {
      switch (type) {
        case "draft_task":
          return await goApiClient.request(
            `/tasks/draft/files/${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            },
            "text",
          );

        case "mentorship_chat":
          return await goApiClient.request(
            `/chats/${encodeURIComponent(args.chatId)}/${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            },
          );

        case "solution_workspace":
          return await goApiClient.request(
            `/workspaces/${args.workspaceId}/files/${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            },
          );

        case "task":
          /**
           * Not Yet Needed
           */
          break;
        case "editor":
          return await goApiClient.request(
            `/editor/files/${encodeURIComponent(args.filePath)}`,
            {
              method: "DELETE",
            },
          );
      }
    },
    onMutate: ({ filePath }) => {
      toast.loading("deleting..", {
        id: `delete-file-${filePath}`,
      });
    },
    onSuccess: (_data, { filePath }) => {
      if (_data?.error) {
        toast.error(_data?.error, {
          id: `delete-file-${filePath}`,
        });
      }
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
      const res = await goApiClient.request<Blob>(
        `/media/${encodeURIComponent(key)}?type=download`,
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

      const res = await goApiClient.request<string>(
        `/media/${encodeURIComponent(key)}`,
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

export function useFileUrl(key: string | null) {
  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["filePresigned", key],
    queryFn: async () => {
      const response = await goApiClient.request<{
        url: string;
        validTime: number;
      }>(
        `/media/${encodeURIComponent(key!)}?type=presigned`,
        { method: "GET" },
        "json",
      );

      if (response.error || !response.data) {
        throw new Error("Failed to fetch presigned URL");
      }

      return response.data;
    },
    enabled: !!key,

    staleTime: (query) => {
      const validTimeNs = query.state.data?.validTime;
      if (!validTimeNs) return 0;

      return Time.toMs(validTimeNs - Time.Seconds(30));
    },
  });

  return {
    url: res?.url || null,
    isLoading,
    isError,
  };
}
