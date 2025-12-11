import { isAuthorized } from "@/features/auth/server/actions";
import {
  getModeratorTaskStats
} from "@/features/tasks/server/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { user, Auth } = await isAuthorized(["MODERATOR"], {
    useResponse: true,
  });
  if (Auth.isAuthError) {
    return Auth.response;
  }

  const data = await getModeratorTaskStats();
  return NextResponse.json(data);
}
