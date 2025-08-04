import { Table, TableBody } from '@/components/ui/table'
import { Columns, RefundTable } from '@/features/tasks/components/refund/refundComps'
import { getAllDisputes } from '@/features/tasks/server/action'
import { ColumnDef } from "@tanstack/react-table"
import React from 'react'

export default async function Page() {
  const allDisputes = await getAllDisputes()
  return (
    <main className='w-full h-full flex  justify-center '>
      <div className='w-4/5 my-10'>
        <RefundTable columns={Columns} data={allDisputes}/>
      </div>
      
    </main>

  )
}
