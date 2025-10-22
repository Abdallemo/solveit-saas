import { isAuthorized } from "@/features/auth/server/actions";
import { getTaskCategoriesData } from "@/features/tasks/server/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { user, Auth } = await isAuthorized(["ADMIN"], { useResponse: true });
  if (Auth.isAuthError) {
    return Auth.response;
  }

  let from = req.nextUrl.searchParams.get("from");
  let to = req.nextUrl.searchParams.get("to");
  const data = await getTaskCategoriesData(from!, to!);
  return NextResponse.json(data);
}
