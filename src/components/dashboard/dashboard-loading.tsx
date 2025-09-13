import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="w-full h-full bg-background p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-20" />
              <Skeleton className="h-4 w-32" />
              <div className="flex items-end gap-2 h-32">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-4 w-40" />
              <div className="flex items-end gap-2 h-32">
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-4 w-36" />
              <div className="relative h-32">
                <div className="absolute inset-0 flex items-end">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
                <div className="absolute bottom-8 left-4 right-4">
                  <Skeleton className="h-0.5 w-full" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
