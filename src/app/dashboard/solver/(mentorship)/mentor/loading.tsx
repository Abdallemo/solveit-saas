import { Skeleton } from "@/components/ui/skeleton"

export default function SessionListSkeleton() {
  return (
    <div className="h-full w-full">
      <div className="mx-auto px-10 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="flex-1 h-9" />
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Session Cards */}
        <div className="flex flex-col w-full gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              {/* Expanded Session Details (optional - shows for first card) */}
              {i === 1 && (
                <div className="border-t bg-muted/20">
                  {[1, 2].map((j) => (
                    <div key={j} className={`flex items-center justify-between p-3 ${j !== 2 ? "border-b" : ""}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Skeleton className="w-2 h-2 rounded-full" />
                          <Skeleton className="h-4 w-16" />
                        </div>

                        <div className="flex items-center gap-4 flex-wrap min-w-0">
                          <Skeleton className="h-5 w-64" />
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
