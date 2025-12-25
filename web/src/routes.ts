/**
 * an array of routes that is accessible to the public
 * these dont require authenitcaton nor authorization
 */
export const publicRoutes = [
  "/",
  "/about-us",
  "/contact-us",
  "/blog/:path*",
  "/privacy-policy",
  "/terms-of-service",
];
/**
 * an array of routes that used for authentication
 * these will redirect loggin users to their dashboard
 */
export const authRoutes = [
  "/login",
  "/register",
  "/login/error",
  "/login/verify",
];
/**
 * an array of routes that is accessible to the public apis
 * these dont require authenitcaton but authorization
 */
export const publicApiRoutes = [
  "/api/auth/:path*",
  "/api/webhooks/stripe/:path*",
  "/api/logs",
  "/api/auth/jwks",
  // "/api/webrtc",
];
