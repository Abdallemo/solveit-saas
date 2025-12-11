import { isAuthorized } from "@/features/auth/server/actions";
import { deleteMediaFileFromDb } from "@/features/media/server/action";
import { goServerApi } from "@/lib/go-api/server";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  const { user, Auth } = await isAuthorized(
    ["SOLVER", "ADMIN", "POSTER", "MODERATOR"],
    {
      useResponse: true,
    },
  );
  if (Auth.isAuthError) {
    return Auth.response;
  }
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return new Response("Missing key", { status: 400 });
  }
  try {
    const res = await goServerApi.request("/media", {
      method: "DELETE",
      body: JSON.stringify({ key }),
    });

    if (res.error) {
      return new Response("Failed to delete file", { status: res.status });
    }
    await deleteMediaFileFromDb(key);
    return new Response("Successfully Deleted", { status: res.status });
  } catch (error) {
    return new Response("Failed to delete file", { status: 500 });
  }
}
