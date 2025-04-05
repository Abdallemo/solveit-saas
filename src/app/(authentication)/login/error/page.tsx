import React from 'react'
import {Card,CardHeader, CardFooter} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
export default function LoginErrorPage() {
  return (
    <main className='w-full h-screen flex flex-col place-items-center justify-center'>
        <Card className='w-[25rem] shadow-md flex flex-col text-center'>
        <CardHeader>
            <p className='text-muted-foreground text-center'>Oops Something went Wrong</p>
        </CardHeader>
        <CardFooter >
            <Button variant={'link'} asChild><Link href={'/login'}  > Back to Login</Link></Button>
        </CardFooter>
    </Card>
    </main>
  )
}
