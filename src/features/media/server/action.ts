"use server";

import db from "@/drizzle/db";
import { GlobalMediaFiles } from "@/drizzle/schemas";
import { env } from "@/env/server";
import { GoHeaders } from "@/lib/go-config";
import { logger } from "@/lib/logging/winston";
import { eq } from "drizzle-orm";
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
      },
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
export type UploadOptions = {
  files: File[];
  scope: string;
  url: string;
};
type UploadResponse = {
  uploaded_files: UploadedFileMeta[];
  failed_files: { file: UploadedFileMeta; error: string }[];
};
type uploadFilesReturnType = {
  error: string | null;
  response: UploadResponse;
};

export async function uploadFiles({
  files,
  scope,
  url,
}: UploadOptions): Promise<uploadFilesReturnType> {
  const formData = new FormData();
  files.forEach((file) => {
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
      return {
        error:
          (errorData.message as string) ||
          `HTTP error! status: ${response.status}`,
        response: {
          failed_files: [],
          uploaded_files: [],
        },
      };
    }
    const data: UploadResponse = await response.json();
    return {
      response: data,
      error: null,
    };
  } catch (error) {
    logger.error("Error in uploadFiles:", { error: error });
    return {
      error: "internal error",
      response: {
        failed_files: [],
        uploaded_files: [],
      },
    };
  }
}
export async function saveMediaFileToDb(media: UploadedFileMeta) {
  try {
    await db.insert(GlobalMediaFiles).values(media);
  } catch (error) {
    logger.error("failed to save media to global media table", {
      message: (error as Error).message,
      cause: (error as Error).cause,
    });
  }
}
export async function deleteMediaFileFromDb(key: string) {
  try {
    await db.delete(GlobalMediaFiles).where(eq(GlobalMediaFiles.filePath, key));
  } catch (error) {
    logger.error("failed to delete media from global media table", {
      message: (error as Error).message,
      cause: (error as Error).cause,
    });
  }
}
