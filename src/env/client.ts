import {createEnv} from '@t3-oss/env-nextjs'
import {z} from 'zod'
export const env = createEnv({
    emptyStringAsUndefined:true,
    client:{
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:z.string()
    },
    runtimeEnv:{
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    },
})
