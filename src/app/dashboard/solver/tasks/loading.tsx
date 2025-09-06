import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export default function Loading() {
  return (
    <div className="pt-10 py-10 md:p-6 w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">

        <Skeleton className="h-5 w-16" />
        <div className="text-sm text-muted-foreground">
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="absolute right-3 top-2.5">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Task cards */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="mb-4 border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex items-center gap-1 mb-3">
            <Skeleton className="h-4 w-32" />
            <span className="mx-1">•</span>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  )
}
