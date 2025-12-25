import { authRoutes, publicApiRoutes, publicRoutes } from "@/routes";
import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse, URLPattern } from "next/server";

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const sessionCookie = getSessionCookie(req);

  const isLoggedIn = !!sessionCookie;

  const res = NextResponse.next();
  res.headers.set("x-full-url", nextUrl.href);
  const matches = (patterns: string[]) => {
    return patterns.some((p) => {
      return new URLPattern({ pathname: p }).test({ pathname: path });
    });
  };

  const isPublicRoutes = matches(publicRoutes);
  const isPublicApiRoutes = matches(publicApiRoutes);
  const isAuthRoutes = matches(authRoutes);

  if (path.startsWith("/api")) {
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
