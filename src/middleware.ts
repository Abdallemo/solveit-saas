import authConfig from "@/lib/auth.config";
import {
  apiAuthPrefix,
  apiLogsPrefix,
  apiMediaPrefix,
  apiStripePrefix,
  apiStripePrefixPayment,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
} from "@/routes";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const res = NextResponse.next();
  res.headers.set("x-full-url", nextUrl.href);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isApiStripePrefix = nextUrl.pathname.startsWith(apiStripePrefix);
  const isApiStripePrefixPayment = nextUrl.pathname.startsWith(
    apiStripePrefixPayment
  );
  const isApiMediaPrefix = nextUrl.pathname.startsWith(apiMediaPrefix);
  const isApiLogsPrefix = nextUrl.pathname.startsWith(apiLogsPrefix);
  const isPublicRoutes = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoutes = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) return res;
  if (isApiStripePrefix) return res;
  if (isApiStripePrefixPayment) return;
  res;
  if (isApiMediaPrefix) return res;
  if (isApiLogsPrefix) return res;

  if (isAuthRoutes) {
    if (isLoggedIn)
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));

    return res;
  }

  if (!isLoggedIn && !isPublicRoutes) {
    return Response.redirect(new URL("/login", nextUrl));
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
