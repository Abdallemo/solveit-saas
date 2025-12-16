// middleware.ts
import {
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicApiRoutes,
  publicRoutes,
} from "@/routes";
import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const sessionCookie = getSessionCookie(req);

  const isLoggedIn = !!sessionCookie;

  const res = NextResponse.next();
  res.headers.set("x-full-url", nextUrl.href);

  const isPublicRoutes = publicRoutes.includes(path);
  const isPublicApiRoutes = publicApiRoutes.some((route) =>
    path.startsWith(route),
  );
  const isAuthRoutes = authRoutes.includes(path);

  if (nextUrl.pathname.startsWith("/api")) {
    if (isPublicApiRoutes) return res;
    if (nextUrl.pathname.startsWith("/api/auth")) return res;

    if (!isLoggedIn) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return res;
  }

  if (isAuthRoutes) {
    return res;
  }

  if (!isLoggedIn && !isPublicRoutes) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv||docx?|mp4|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
