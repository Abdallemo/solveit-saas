import { env } from "@/env/server";
import { auth } from "@/lib/auth";
import { GoApiClient } from "@/lib/go-api/core";
import { headers } from "next/headers";
import "server-only";

export const goApiClient = new GoApiClient(async () => {
  const session = await auth.api.getToken({
    headers: await headers(),
  });
  return session?.token || null;
}, env.GO_API_URL);
