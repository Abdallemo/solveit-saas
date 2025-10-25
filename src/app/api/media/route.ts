import { env } from "@/env/server";
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

