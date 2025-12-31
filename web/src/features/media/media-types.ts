/**
 * This file defines the core TypeScript types used for managing file uploads,
 * downloads, and presigned URLs within the application.
 *
 * It includes metadata structures for uploaded files and types for
 * generating and responding to presigned URL requests.
 */

/** **scope**: Defines the context for file operations ('workspace', 'task',...).
its extendable in the future  */
export type scope = "workspace" | "task";

export type WorkspaceUploadedFileMeta = {
  id: string;
  workspaceId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  storageLocation: string;
  uploadedAt: Date | null;
  uploadedById: string;
  isDraft: boolean | null;
};

/** **UploadedFileMeta:** Data sent to finalize a file upload */

export type UploadedFileMeta = {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  storageLocation: string;
};

type ExtraBody = Record<string, string | number | boolean>;

export type UploadOptions = {
  files: File[];
  url: string;
  extraBody?: ExtraBody;
};
export type UploadResponse = {
  uploaded_files: UploadedFileMeta[];
  failed_files: { file: UploadedFileMeta; error: string }[];
};
