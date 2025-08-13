'server-only'

import { TierType } from '@/drizzle/schemas'
import { env } from '@/env/server'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
export const SubMap:Record<string,TierType>={
  [env.STRIPE_SOLVER_PRODUCT_ID]:"SOLVER",
  [env.STRIPE_SOLVER_PLUS_PRICE_ID]:"SOLVER++",
}