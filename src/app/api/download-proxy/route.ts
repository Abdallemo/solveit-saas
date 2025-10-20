import { env } from "@/env/server";
import { GoHeaders } from "@/lib/go-config";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return new Response("Missing key", { status: 400 });
  }

  const res = await fetch(
    `${env.GO_API_URL}/media/download?key=${encodeURIComponent(key)}`,
    {
      headers: GoHeaders,
      method:"GET"
    }
  );

  if (!res.ok || !res.body) {
    return new Response("Failed to fetch file", { status: res.status });
  }

  return new Response(res.body, {
    headers: {
      "Content-Disposition":
        res.headers.get("Content-Disposition") || "attachment",
      "Content-Type":
        res.headers.get("Content-Type") || "application/octet-stream",
    },
  });
}
