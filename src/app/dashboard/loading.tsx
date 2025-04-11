import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full bg-sidebar">
      
      <div className="hidden w-64 flex-col border-r bg-card md:flex">
        
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="h-8 w-32" />
        </div>

        
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="flex flex-1 flex-col">
      
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="md:hidden h-8 w-8 rounded-md" />
          <Skeleton className="ml-4 h-5 w-32" />
          <Skeleton className="ml-auto h-8 w-8 rounded-full" />
        </div>

        <div className="p-4 md:p-6">
         
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-3 h-6 w-20" />
              </div>
            ))}
          </div>

         
          <div className="mt-6 rounded-lg border bg-card p-4 shadow-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-[200px] w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

