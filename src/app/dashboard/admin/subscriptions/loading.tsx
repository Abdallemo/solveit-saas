import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SubscriptionManagementSkeleton() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Page title and description */}
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Export button */}
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriptions Table Section */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Filter and Columns */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" /> {/* Filter input */}
          <Skeleton className="h-10 w-24" /> {/* Columns button */}
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          {/* Table Header */}
          <div className="border-b bg-muted/50 p-4">
            <div className="grid grid-cols-7 gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>

          {/* Table Rows */}
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border-b last:border-b-0 p-4">
              <div className="grid grid-cols-7 gap-4 items-center">
                {/* Customer */}
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>

                {/* Plan */}
                <Skeleton className="h-4 w-16" />

                {/* Status */}
                <Skeleton className="h-6 w-14 rounded-full" />

                {/* Amount */}
                <div className="space-y-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>

                {/* Billing Cycle */}
                <Skeleton className="h-4 w-14" />

                {/* Current Period */}
                <Skeleton className="h-4 w-32" />

                {/* Actions */}
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
