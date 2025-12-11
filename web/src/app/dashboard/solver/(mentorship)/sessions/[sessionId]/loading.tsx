import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        {/* Date and time */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Center text */}
        <Skeleton className="h-5 w-40" />

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <Skeleton className="mb-4 h-16 w-16 rounded-full" />
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Sidebar */}
        <aside className="w-80 border-l border-border p-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </aside>
      </div>

      {/* Message input footer */}
      <footer className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </footer>
    </div>
  )
}
