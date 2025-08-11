"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/cloudFlairR2";
import { scope } from "./media-types";
import { env } from "@/env/server";
import { logger } from "@/lib/logging/winston";


export async function deleteFileFromR2(filePath: string) {
  try {
    const res =await fetch(`${env.GO_API_URL}/media`,{
      method:"DELETE",
      body:JSON.stringify({key:filePath})
    })
    if (!res.ok){
      throw new Error("Failed to delete"+res.statusText)
    }
  } catch (error) {
    logger.error("error deleting",error)
      throw new Error("Failed to delete")
  }
}

/**
 * Uploads an array of File objects to the specified media endpoint.
 */
type UploadOptions = {
  files: File[];
  scope: string;
  url: string;
};

export async function uploadFiles({
  files,
  scope,
  url ,
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
        logger.error("error uploading file",errorData)
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error in uploadFiles:", {error:error});
    throw error;
  }
}
