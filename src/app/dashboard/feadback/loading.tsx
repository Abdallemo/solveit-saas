import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>

            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
