import { PaymentTable } from '@/features/payments/components/PaymentTable'
import { getAllPayments } from '@/features/payments/server/action'
import React from 'react'

export default async function Page() {
  const allPayments = await getAllPayments()
  return (
    <main className='w-full h-full flex  justify-center '>
      <div className='container mx-auto py-6 px-4'>
       <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Manage All System Payments
          </p>
        <PaymentTable data={allPayments}/>
      </div>
      
    </main>

  )
}
