/**
 * an array of routes that is accessible to the public
 * these dont require authenitcaton nor authorization
 */
export const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/blog",
  "/resources",
  "/faq",
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

export const apiAuthPrefix = "/api/auth";
export const apiStripePrefix = "/api/webhooks/stripe";
export const apiStripePrefixPayment = "/api/webhooks/stripe/taskPayment";
export const apiMediaPrefix = "/api/media";
export const apiLogsPrefix = "/api/logs";

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
