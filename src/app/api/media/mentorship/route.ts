import db from "@/drizzle/db";
import { MentorshipChatFilesTable } from "@/drizzle/schemas";
import { env } from "@/env/server";
import { isAuthorized } from "@/features/auth/server/actions";
import { deleteFileFromChatSessionDb } from "@/features/mentore/server/action";
import { GoHeaders } from "@/lib/go-config";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  const { user, Auth, session } = await isAuthorized(["POSTER", "SOLVER"], {
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
    const file = await db.query.MentorshipChatFilesTable.findFirst({
      where: eq(MentorshipChatFilesTable.filePath, key),
      with: {
        chat: { columns: { sessionId: true } },
      },
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
    await deleteFileFromChatSessionDb(file.id, session?.user.id!);

    return new Response("Successfully Deleted", { status: res.status });
  } catch (error) {
    return new Response("Failed to delete file", { status: 500 });
  }
}
