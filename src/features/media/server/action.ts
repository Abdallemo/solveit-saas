"use server"

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/cloudFlairR2";
import { randomUUID } from "crypto";

export type UploadedFileMeta = {
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  storageLocation: string;
};
export async function UploadFileToS3(files:File| File[]) {
    
}
export async function getPresignedUploadUrl(fileName: string, fileType: string) {
  const key = `tasks/${randomUUID()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: "solveit",
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
  return {
    uploadUrl: url,
    filePath: key,
    publicUrl: `https://pub-c60addcb244c4d23b18a98d686f3195e.r2.dev/solveit/${key}`,
  };
}