'use client'

import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'

export function SubmitButtonWithStatus() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} variant="success">
      {pending ? 'Submitting...' : 'Proceed With Payment'}
    </Button>
  )
}
