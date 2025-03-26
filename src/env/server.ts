import {createEnv} from '@t3-oss/env-nextjs'
import {z} from 'zod'
export const env = createEnv({
    emptyStringAsUndefined:true,
    server:{
        AUTH_GITHUB_ID:z.string(),
        STRIPE_SECRET_KEY:z.string(),
        AUTH_SECRET:z.string(),
        AUTH_GITHUB_SECRET:z.string()
    },
    experimental__runtimeEnv:process.env,
})
