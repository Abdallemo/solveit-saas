import { env } from "@/env/server";
import {
  GetCachedValue,
  SetCachedValue,
  TTL,
  TurnServerType,
} from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
const Static_TURN = [
  {
    urls: ["stun:stun.cloudflare.com:3478"],
  },
  {
    urls: [
      "turn:turn.cloudflare.com:3478?transport=udp",
      "turn:turn.cloudflare.com:3478?transport=tcp",
      "turns:turn.cloudflare.com:5349?transport=tcp",
      "turns:turn.cloudflare.com:443?transport=tcp",
    ],
  },
];
const defualtRes: TurnServerType = {
  createdAt: new Date(),
  ttl: TTL,
  turn: [Static_TURN[0]],
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
    const credentialedTurnEntry = turn.iceServers.find(
      (server) => server.username
    );

    if (!credentialedTurnEntry) {
      throw new Error("Cloudflare response missing expected TURN credentials.");
    }
    const tranformedTurn: RTCIceServer[] = [
      {
        urls: ["stun:stun.cloudflare.com:3478"],
      },
      {
        urls: [
          "turn:turn.cloudflare.com:3478?transport=udp",
          "turns:turn.cloudflare.com:5349?transport=tcp",
        ],
        username: credentialedTurnEntry.username,
        credential: credentialedTurnEntry.credential,
      },
    ];
    const data: TurnServerType = {
      createdAt: new Date(),
      ttl: TTL,
      turn: tranformedTurn,
    };

    await SetCachedValue("TURN_CACHE", data);
    return NextResponse.json(data);
  } catch (err) {
    console.error(
      `[turn generation process failed]:",${(err as Error).message},\n,${err}`
    );
    return NextResponse.json(defualtRes);
  }
}
