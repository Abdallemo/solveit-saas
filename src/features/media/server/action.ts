"use server";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/cloudFlairR2";
import { randomUUID } from "crypto";
import {
  GeneratePresignedUrlInput,
  PresignedUploadedFileMeta,
  PresignedUrlResponse,
  scope,
} from "./media-types";
import { env } from "@/env/server";


export async function deleteFileFromR2(filePath: string) {
  const command = new DeleteObjectCommand({
    Bucket: "solveit",
    Key: filePath,
  });

  try {
    await s3.send(command);
    return { success: true };
  } catch (err) {
    console.error("R2 deletion failed:", err);
    return { success: false };
  }
}

/**
 * Uploads an array of File objects to the specified media endpoint.
 */
export async function uploadFiles(opts:{files:File[],scope:scope}) {
  const {files,scope} = opts
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("scope",scope)
  try {
    const response = await fetch(`${env.NEXTAUTH_URL}/api/media`, {
      method: "POST", 
      body: formData, 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error in uploadFiles:", error);
    throw error; 
  }
}