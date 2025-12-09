import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "zod";
export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    AUTH_GITHUB_ID: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    AUTH_SECRET: z.string(),
    AUTH_GITHUB_SECRET: z.string(),
    DATABASE_URL: z.string(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    OPENAI_API_KEY: z.string(),
    HUGGINGFACE_API_KEY: z.string(),
    NEXTAUTH_URL: z.string(),
    AUTH_GOOGLE_REFRESH_TOKEN: z.string(),
    STRIPE_SOLVER_PRICE_ID: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    SENTRY_DSN: z.string(),
    SENTRY_ENVIRONMENT: z.string(),
    GMAIL_APP_PASSWORD: z.string(),
    GMAIL_APP_EMAIL: z.string(),
    S3_SECRTE_ACCESS_KEY_ID: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_ENDPOINT: z.string(),
    GO_API_URL: z.string(),
    STRIPE_SOLVER_PLUS_PRICE_ID: z.string(),
    GO_API_AUTH: z.string(),
    PRODUCTION_URL: z.string(),
    CLOUDFLARE_API_TOKEN: z.string(),
    Turn_Token_ID: z.string(),
    Turn_API_Token: z.string(),
    CLOUDFLARE_ACCOUNT_ID: z.string(),
    REDIS_URL: z.string(),
    STRIPE_CONNECT_WEBHOOK_SECRET: z.string(),
    STRIPE_TEST_MODE: z.string().transform((val) => {
      const lowerVal = val.toLowerCase();
      return lowerVal === "true" || lowerVal === "1";
    }),
    NEXT_PORT: z.string().transform((val) => Number(val)),
  },
  experimental__runtimeEnv: process.env,
});
