import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Lock } from "lucide-react";

export function PaymentDialogSkeleton() {
  return (
    <Card className="w-full max-w-md">
    

      <CardContent className="space-y-6">
        {/* Card Tab */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-8" />
        </div>

        {/* Secure Checkout Section */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
          <Lock className="h-4 w-4 text-green-600" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-3" />
        </div>

        {/* Card Number */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="relative">
            <Skeleton className="h-10 w-full" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-6 w-8" />
            </div>
          </div>
        </div>

        {/* Expiration and Security Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="relative">
              <Skeleton className="h-10 w-full" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Skeleton className="h-4 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="relative">
            <Skeleton className="h-10 w-full" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Skeleton className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <Skeleton className="h-12 w-full bg-green-200" />
      </CardContent>
    </Card>
  );
}
