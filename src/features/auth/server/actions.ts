"use server";
import { UserRoleType as UserRole } from "@/drizzle/schemas";
import { DeleteUserFromDb } from "@/features/users/server/actions";
import { Session, User } from "@/features/users/server/user-types";
import { auth } from "@/lib/auth";
import { DEFAULTREVALIDATEDURATION } from "@/lib/cache";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

//* session
export async function getServerUserSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;
  return session?.user;
}
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
export async function userRoleSession() {
  const r = await getServerSession();
  const role = r?.user.role;
  return role as UserRole;
}

//* Auth Db Calls

type verificationTokenReturn =
  | {
      error?: "EXPIRED" | "INVALID";
      success?: "VERIFIED";
    }
  | undefined;

type UnauthorizedRespType = {
  isAuthError: boolean;
  response: NextResponse;
};

const createSuccessAuth = (): UnauthorizedRespType => ({
  isAuthError: false,
  response: new NextResponse(JSON.stringify({ message: "Authorized" }), {
    status: 200,
  }),
});

const createFailureAuth = (): UnauthorizedRespType => ({
  isAuthError: true,
  response: new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  }),
});

export async function isAuthorized(
  whichRole: UserRole[],
  options?: { useCache?: boolean; revalidate?: number; useResponse?: false },
): Promise<{ user: User; session: Session }>;

export async function isAuthorized(
  whichRole: UserRole[],
  options: { useCache?: boolean; revalidate?: number; useResponse: true },
): Promise<{
  user: User | null;
  session: Session | null;
  Auth: UnauthorizedRespType;
}>;

export async function isAuthorized(
  whichRole: UserRole[],
  options: {
    useCache?: boolean;
    revalidate?: number;
    useResponse?: boolean;
  } = {
    useCache: true,
    revalidate: DEFAULTREVALIDATEDURATION,
    useResponse: false,
  },
): Promise<any> {
  const redirectOrReturnError = (url: string): UnauthorizedRespType | void => {
    if (options.useResponse) return createFailureAuth();
    return redirect(url);
  };

  const handleFailure = (url: string, status: number = 302): any => {
    const errorResult = redirectOrReturnError(url);
    if (options.useResponse && errorResult) {
      return { user: null, session: null, Auth: errorResult };
    }
  };

  const session = await getServerSession();
  if (!session) {
    return handleFailure("/login");
  }

  const user = session.user;
  if (!user || !user.id || !user.role) {
    return handleFailure("/login");
  }

  const userId: string = user.id;
  const userRole: UserRole = user.role as UserRole;

  if (!user.emailVerified) {
    return handleFailure(`/${userId}/account-deactivated`);
  }

  if (!whichRole.includes(userRole)) {
    console.log("redirecting user");
    return handleFailure(`/dashboard/${userRole.toLocaleLowerCase()}`);
  }

  if (options.useResponse) {
    return {
      user,
      session: session,
      Auth: createSuccessAuth(),
    };
  }
  return { user, session: session };
}
export async function DeleteUserAccount() {
  console.log("delete trigered");

  const { user } = await isAuthorized([
    "SOLVER",
    "ADMIN",
    "MODERATOR",
    "POSTER",
  ]);

  await DeleteUserFromDb(user.id);
  revalidateTag(`user-${user.id}`);
}
