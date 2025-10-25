import db from "@/drizzle/db";
import { WorkspaceFilesTable } from "@/drizzle/schemas";
import { env } from "@/env/server";
import { isAuthorized } from "@/features/auth/server/actions";
import { GoHeaders } from "@/lib/go-config";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  const { user, Auth } = await isAuthorized(["SOLVER"], {
    useResponse: true,
  });
  if (Auth.isAuthError) {
    return Auth.response;
  }
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return new Response("Missing key", { status: 400 });
  }
  try {
    const file = await db.query.WorkspaceFilesTable.findFirst({
      where: eq(WorkspaceFilesTable.filePath, key),
    });

    if (!file) {
      return new Response("File not found", { status: 400 });
    }
    const res = await fetch(`${env.GO_API_URL}/media`, {
      method: "DELETE",
      headers: GoHeaders,
      body: JSON.stringify({ key: file.filePath }),
    });

    if (!res.ok || !res.body) {
      return new Response("Failed to delete file", { status: res.status });
    }
    await db
      .delete(WorkspaceFilesTable)
      .where(eq(WorkspaceFilesTable.id, file.id));
    revalidatePath(`workspace/${file.workspaceId}`);

    return new Response("Successfully Deleted", { status: res.status });
  } catch (error) {
    return new Response("Failed to delete file", { status: 500 });
  }
}
