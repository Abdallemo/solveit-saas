import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    
    const session = await stripe.checkout.sessions.create({
        mode:'subscription',
        
        success_url:`${origin}/dashboard/`,
        
        cancel_url:`${origin}/?canceled=true`,
        line_items:[
            {
                price:'price_1R6lRSGJkII4ZRV5SMAf4FmF',
                quantity:1
            }
        ],
        subscription_data:{
            
        },
        
    })
    return NextResponse.redirect(session.url!, 303)
  } catch (err: unknown) {
    if (err instanceof stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode || 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}