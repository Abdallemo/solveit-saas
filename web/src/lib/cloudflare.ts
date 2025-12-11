import { env } from "@/env/client";
import { TurnServerType } from "./redis";

export async function getTurnCredentials(Cookie?: string) {
  const res = await fetch(`${env.NEXT_PUBLIC_URL}/api/webrtc`, {
    headers: Cookie ? { Cookie } : {},
  });
  const data: TurnServerType = await res.json();
  return data;
}
