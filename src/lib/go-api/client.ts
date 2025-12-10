import { env } from "@/env/client";
import { authClient } from "@/lib/auth-client";
import { GoApiClient } from "@/lib/go-api/core";

export const goClientApi = new GoApiClient(async () => {
  const res = await authClient.token();
  return res.data?.token || null;
}, env.NEXT_PUBLIC_GO_API_URL);
