"use client" 

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-50">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">Something went wrong!</h1>
      <p className="mb-8 text-lg text-gray-600 max-w-md">
        We apologize for the inconvenience. Our team has been notified of this issue.
      </p>
      <Button onClick={() => reset()} className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Try again
      </Button>

      {/* Uncomment this section to show a maintenance message instead */}
      {/* 
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-amber-50">
        <ToolIcon className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">Under Maintenance</h1>
      <p className="mb-8 text-lg text-gray-600 max-w-md">
        We're currently performing scheduled maintenance to improve your experience.
        Please check back soon.
      </p>
      */}
    </div>
  )
}
