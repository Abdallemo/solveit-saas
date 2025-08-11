import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import NotificationsPage from "@/features/notifications/components/NotificationsPage"
import { getAllNotification } from "@/features/notifications/server/action"
import { getServerUserSession } from "@/features/auth/server/actions"


function NotificationsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export  default async function Page() {
  const user = await getServerUserSession()
  
  const notifications = await getAllNotification(user?.id!,10)
  return (
    <Suspense fallback={<NotificationsPageSkeleton />}>
      <NotificationsPage initialNotifications={notifications} />
    </Suspense>
  )
}
