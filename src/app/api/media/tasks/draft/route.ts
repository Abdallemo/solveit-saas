import db from "@/drizzle/db";
import { TaskDraftTable } from "@/drizzle/schemas";
import { env } from "@/env/server";
import { isAuthorized } from "@/features/auth/server/actions";
import { GoHeaders } from "@/lib/go-config";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  const { user, Auth } = await isAuthorized(["POSTER"], { useResponse: true });
  if (Auth.isAuthError) {
    return Auth.response;
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return new Response("Missing key", { status: 400 });
  }
  try {
    const res = await fetch(`${env.GO_API_URL}/media`, {
      method: "DELETE",
      headers: GoHeaders,
      body: JSON.stringify({ key }),
    });

    if (!res.ok || !res.body) {
      return new Response("Failed to delete file", { status: res.status });
    }
    await db
      .update(TaskDraftTable)
      .set({ uploadedFiles: [] })
      .where(eq(TaskDraftTable.userId, user?.id!));

    return new Response("Successfully Deleted", { status: res.status });
  } catch (error) {
    return new Response("Failed to delete file", { status: 500 });
  }
}
