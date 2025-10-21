import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-full w-full flex flex-col flex-1 p-6 items-center gap-3">
      <Skeleton className="h-8 w-64 mt-2" />
      <Skeleton className="h-5 w-96 mb-3" />
      <div className="w-4/5 ">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-10 w-28" />
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <Skeleton className="h-5 w-full text-sm mb-1" />
                    <Skeleton className="h-5 w-11/12 text-sm" />
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Skeleton className="h-8 w-20" />

                    <Skeleton className="h-8 w-8 rounded-md" />

                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <Skeleton className="h-5 w-5/6 text-sm mb-1" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 pt-6 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <Skeleton className="h-5 w-full text-sm mb-1" />
                    <Skeleton className="h-5 w-4/5 text-sm" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
