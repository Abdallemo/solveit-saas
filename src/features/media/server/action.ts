"use server";

import { env } from "@/env/server";
import { GoHeaders } from "@/lib/go-config";
import { logger } from "@/lib/logging/winston";
import { UploadedFileMeta } from "./media-types";

export async function deleteFileFromR2(filePath: string) {
  try {
    const res = await fetch(`${env.GO_API_URL}/media`, {
      method: "DELETE",
      headers: GoHeaders,
      body: JSON.stringify({ key: filePath }),
    });
    if (!res.ok) {
      throw new Error("Failed to delete" + res.statusText);
    }
  } catch (error) {
    logger.error("error deleting", error);
    throw new Error("Failed to delete");
  }
}
export async function downloadFileFromR2(filePath: string) {
  try {
    const res = await fetch(
      `${env.GO_API_URL}/media/download?key=${filePath}`,
      {
        method: "GET",
        headers: GoHeaders,
      }
    );
    if (!res.ok) {
      throw new Error("Failed to download," + res.statusText);
    }

    const arrayBuffer = await res.arrayBuffer();
    const fileName = filePath.split("/").pop() || "downloaded-file";
    return { arrayBuffer, fileName };
  } catch (error) {
    logger.error("error download,", error);
    throw new Error("Failed to download");
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

export async function uploadFiles({ files, scope, url }: UploadOptions) {
  const formData = new FormData();
  files.forEach((file) => {
    if(file.size >= 50<<20){
      throw new Error("file Exceeded Limit")
    }
    formData.append("files", file);
  });
  formData.append("scope", scope);
  try {
    const response = await fetch(url, {
      headers: GoHeaders,
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      logger.error("error uploading file", JSON.stringify(errorData));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    const data:UploadedFileMeta[] = await response.json();
    return data;
  } catch (error) {
    logger.error("Error in uploadFiles:", { error: error });
    throw error;
  }
}
