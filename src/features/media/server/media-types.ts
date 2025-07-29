/**
 * This file defines the core TypeScript types used for managing file uploads,
 * downloads, and presigned URLs within the application.
 *
 * It includes metadata structures for uploaded files and types for
 * generating and responding to presigned URL requests.
 */



/** **scope**: Defines the context for file operations ('workspace', 'task',...). 
its extendable in the future  */
export type scope = "workspace" | "task"

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
/** **PresignedUploadedFileMeta:** Data sent to finalize a presigned upload */
export type PresignedUploadedFileMeta = {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  storageLocation: string;
};
/**GeneratePresignedUrlInput: Parameters for requesting an upload URL. */
export type GeneratePresignedUrlInput = {
  fileName: string;
  fileType: string;
  scope?: scope;
};

/** PresignedUrlResponse: The upload and public URLs returned by the server. */
export type PresignedUrlResponse = {
  uploadUrl: string;
  filePath: string;
  publicUrl: string;
};