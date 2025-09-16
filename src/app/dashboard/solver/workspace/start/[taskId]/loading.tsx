import { Skeleton } from "@/components/ui/skeleton";

export default function TaskSkeleton() {
  return (
    <div className="flex h-full ">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 pb-2">
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>

            {/* <div className="flex-1 overflow-auto p-4 pt-0">
              <div className="border rounded-md flex flex-col h-[500px] lg:h-[800px]">
                <div className="flex items-center gap-1 p-4 border-b rounded-t-lg">
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />

                  <div className="h-6 border-r  mx-3"></div>

                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />

                  <div className="h-6 border-r  mx-3"></div>

                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto p-6">
                    <div className="space-y-5">
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                      <div className="py-2"></div>
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-4/5" />
                      <div className="py-2"></div>
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-5/6" />
                      <div className="py-2"></div>
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-3/4" />
                      <div className="py-2"></div>
                      <Skeleton className="h-7 w-full" />
                      <Skeleton className="h-7 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          <div className="w-80 border-l ">
            <div className="p-6">
              <Skeleton className="h-8 w-44 mb-8" />

              <div className="mb-6">
                <Skeleton className="h-5 w-20 mb-3" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>

              <div className="mb-6">
                <Skeleton className="h-5 w-28 mb-3" />
                <Skeleton className="h-32 w-full rounded-md" />
              </div>

              <div className="mb-6">
                <Skeleton className="h-5 w-24 mb-3" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>

              <div className="mb-6">
                <Skeleton className="h-5 w-24 mb-3" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>

              <div className="mb-6">
                <Skeleton className="h-5 w-24 mb-3" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>

              <div className="mb-8">
                <Skeleton className="h-5 w-20 mb-3" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="border-2 border-dashed  rounded-lg p-16 text-center">
                  <Skeleton className="h-14 w-14 rounded mx-auto mb-5" />
                  <Skeleton className="h-5 w-72 mx-auto mb-3" />
                  <Skeleton className="h-4 w-56 mx-auto mb-7" />
                  <Skeleton className="h-12 w-36 rounded-md mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
