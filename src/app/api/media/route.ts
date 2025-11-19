import { env } from "@/env/server";
import { isAuthorized } from "@/features/auth/server/actions";
import { deleteMediaFileFromDb } from "@/features/media/server/action";
import { GoHeaders } from "@/lib/go-config";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key) {
    return new Response("Missing 'key' query parameter.", { status: 400 });
  }

  const goResponse = await fetch(
    `${env.GO_API_URL}/media?key=${encodeURIComponent(key)}`,
    {
      headers: GoHeaders,
      cache: "no-store",
      method: "GET",
    }
  );

  if (!goResponse.ok || !goResponse.body) {
    return new Response(`Failed to fetch file: ${goResponse.statusText}`, {
      status: goResponse.status,
    });
  }

  const responseHeaders = new Headers(goResponse.headers);

  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", "application/octet-stream");
  }

  if (!responseHeaders.has("Content-Disposition")) {
    responseHeaders.set("Content-Disposition", "inline");
  }

  return new Response(goResponse.body, {
    headers: responseHeaders,
    status: goResponse.status,
  });
}

export async function DELETE(req: NextRequest) {
  const { user, Auth } = await isAuthorized(
    ["SOLVER", "ADMIN", "POSTER", "MODERATOR"],
    {
      useResponse: true,
    }
  );
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
    await deleteMediaFileFromDb(key);
    return new Response("Successfully Deleted", { status: res.status });
  } catch (error) {
    return new Response("Failed to delete file", { status: 500 });
  }
}
