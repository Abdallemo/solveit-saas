"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/cloudFlairR2";
import { randomUUID } from "crypto";
import {
  GeneratePresignedUrlInput,
  PresignedUploadedFileMeta,
  PresignedUrlResponse,
} from "./media-types";

export async function generatePresignedUrl({
  fileName,
  fileType,
  scope = "workspace",
}: GeneratePresignedUrlInput): Promise<PresignedUrlResponse> {
  const key = `${scope}/${randomUUID()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: "solveit",
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

  return {
    uploadUrl,
    filePath: key,
    publicUrl: `https://pub-c60addcb244c4d23b18a98d686f3195e.r2.dev/solveit/${key}`,
  };
}

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  scope: "workspace" | "task" = "workspace"
) {
  return await generatePresignedUrl({ fileName, fileType, scope });
}

export async function uploadSelectedFiles(
  selectedFiles: File[],
  scope: "workspace" | "task" = "workspace"
) {
  const uploadedFileMeta: PresignedUploadedFileMeta[] = [];

  for (const file of selectedFiles) {
    const presigned = await getPresignedUploadUrl(file.name, file.type, scope);
    await fetch(presigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    uploadedFileMeta.push({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: presigned.filePath,
      storageLocation: presigned.publicUrl,
    });
  }

  return uploadedFileMeta;
}
