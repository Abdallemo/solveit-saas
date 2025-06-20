import {createEnv} from '@t3-oss/env-nextjs'
import {z} from 'zod'
export const env = createEnv({
    emptyStringAsUndefined:true,
    server:{
        AUTH_GITHUB_ID:z.string(),
        STRIPE_SECRET_KEY:z.string(),
        AUTH_SECRET:z.string(),
        AUTH_GITHUB_SECRET:z.string(),
        DATABASE_URL:z.string(),
        AUTH_GOOGLE_ID:z.string(),
        AUTH_GOOGLE_SECRET:z.string(),
        OPENAI_API_KEY:z.string(),
        HUGGINGFACE_API_KEY:z.string(),
        NEXTAUTH_URL:z.string(),
        AUTH_GOOGLE_REFRESH_TOKEN:z.string(),
        STRIPE_PREMIUM_PRODUCT_ID:z.string(),
        STRIPE_WEBHOOK_SECRET:z.string(),
        SENTRY_DSN:z.string(),
        SENTRY_ENVIRONMENT:z.string(),
        GMAIL_APP_PASSWORD:z.string(),
        GMAIL_APP_EMAIL:z.string(),
        S3_SECRTE_ACCESS_KEY_ID:z.string(),
        S3_ACCESS_KEY_ID:z.string(),
        S3_ENDPOINT:z.string(),
    },
    experimental__runtimeEnv:process.env,
})
