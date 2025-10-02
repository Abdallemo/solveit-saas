import { env } from "@/env/server";
import {
  GetCachedValue,
  SetCachedValue,
  TTL,
  TurnServerType,
} from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
const defualtRes: TurnServerType = {
  createdAt: new Date(),
  ttl: TTL,
  turn: [],
};
export async function GET(req: NextRequest) {
  try {
    const cached = await GetCachedValue("TURN_CACHE");
    if (cached) {
      console.info("using cached version");
      return NextResponse.json(cached);
    }

    const res = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${env.Turn_Token_ID}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.Turn_API_Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: TTL }),
      }
    );

    if (!res.ok) throw new Error("Cloudflare TURN failed");

    const turn: { iceServers: RTCIceServer[] } = await res.json();
    const data: TurnServerType = {
      createdAt: new Date(),
      ttl: TTL,
      turn: turn.iceServers,
    };
    await SetCachedValue("TURN_CACHE", data);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(defualtRes);
  }
}
