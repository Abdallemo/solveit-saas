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

export type PresignedUploadedFileMeta = {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  storageLocation: string;
};

export type GeneratePresignedUrlInput = {
  fileName: string;
  fileType: string;
  scope?: "workspace" | "task";
};

export type PresignedUrlResponse = {
  uploadUrl: string;
  filePath: string;
  publicUrl: string;
};
