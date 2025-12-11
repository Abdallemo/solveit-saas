"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 bg-black rounded-lg w-full max-w-xs">
      {/* Profile picture skeleton */}
      <Skeleton className="h-10 w-10 rounded-full" />

      <div className="flex flex-col gap-2 flex-1">
        {/* Name skeleton */}
        <Skeleton className="h-4 w-24" />

        {/* Email skeleton */}
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Optional: Menu icon skeleton */}
      <Skeleton className="h-6 w-6 rounded-md" />
    </div>
  )
}
