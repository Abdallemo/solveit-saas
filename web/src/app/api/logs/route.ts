import db from "@/drizzle/db";
import { logTable } from "@/drizzle/schemas";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const level: string = body.level;
  const timestamp = body.timestamp;
  const message: string = body.message;
  const error: string = body.error;

  await db.insert(logTable).values({
    createdAt: new Date(timestamp),
    level: level,
    message: message,
    error: error ? JSON.stringify(body.error) : null,
  });
  return new Response("Logged");
}
export async function GET(req: NextRequest) {}
