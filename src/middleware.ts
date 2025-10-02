import authConfig from "@/lib/auth.config";
import {
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicApiRoutes,
  publicRoutes,
} from "@/routes";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const res = NextResponse.next();
  const path = nextUrl.pathname;
  res.headers.set("x-full-url", nextUrl.href);

  const isPublicRoutes = publicRoutes.includes(path);
 
  const isPublicApiRoutes = publicApiRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoutes = authRoutes.includes(path);

  if (nextUrl.pathname.startsWith("/api")) {
    if (isPublicApiRoutes) return res;

    if (!isLoggedIn) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return res;
  }

  if (isAuthRoutes) {
    if (isLoggedIn)
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));

    return res;
  }

  if (!isLoggedIn && !isPublicRoutes) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return res;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
