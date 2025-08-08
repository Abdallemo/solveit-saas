"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/cloudFlairR2";
import { scope } from "./media-types";
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
type UploadOptions = {
  files: File[];
  scope: string;
  url?: string;
};

export async function uploadFiles({
  files,
  scope,
  url = `${process.env.NEXTAUTH_URL}/api/media`,
}: UploadOptions) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("scope", scope);
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error in uploadFiles:", error);
    throw error;
  }
}
