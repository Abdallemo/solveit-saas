import { getAIFlagsData } from "@/features/Ai/server/action";
import { isAuthorized } from "@/features/auth/server/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { user, Auth } = await isAuthorized(["ADMIN"], { useResponse: true });
  if (Auth.isAuthError) {
    return Auth.response;
  }

  let from = req.nextUrl.searchParams.get("from");
  let to = req.nextUrl.searchParams.get("to");
  const data = await getAIFlagsData(from!, to!);
  return NextResponse.json(data);
}
