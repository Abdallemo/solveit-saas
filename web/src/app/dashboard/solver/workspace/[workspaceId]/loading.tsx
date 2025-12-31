import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSkeleton() {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] bg-background overflow-hidden">
      <header className="border-b p-4 flex items-center justify-between bg-background z-10">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </header>

      <main className="grid grid-cols-1 md:grid-cols-[1fr_320px] overflow-hidden relative">
        <div className="flex flex-col overflow-hidden border-r">
          <div className="p-4 pb-2">
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>

          <div className="flex-1 overflow-auto p-4 pt-0">
            <div className="border rounded-md flex flex-col h-full max-h-[720px] bg-card">
              <div className="flex items-center gap-1 p-4 border-b overflow-x-auto no-scrollbar">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-9 shrink-0 rounded" />
                ))}
                <div className="h-6 border-r mx-2"></div>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i + 6} className="h-9 w-9 shrink-0 rounded" />
                ))}
              </div>

              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <div className="py-2"></div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden md:flex flex-col bg-background/30 overflow-y-auto border-l">
          <div className="p-6 space-y-8">
            <Skeleton className="h-8 w-44" />

            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-32 w-full rounded-md" />
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-10 w-28 rounded-md mx-auto" />
            </div>
          </div>
        </aside>

        <div className="fixed bottom-6 right-6 md:hidden z-20">
          <Skeleton className="h-14 w-14 rounded-full shadow-lg border-2 border-primary/10" />
        </div>
      </main>
    </div>
  );
}
