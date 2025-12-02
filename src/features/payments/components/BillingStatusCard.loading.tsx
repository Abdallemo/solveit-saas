"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function BillingStatusCardSkeleton() {
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-64 mt-3 rounded-md" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>

        <Card className="border border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-4 w-full mt-2 rounded-md" />
                  <Skeleton className="h-4 w-3/4 mt-1 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-10 w-32 rounded-md whitespace-nowrap" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-3 w-32 rounded-sm" />
                    <Skeleton className="h-8 w-40 rounded-md mt-3" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="h-4 w-4 rounded shrink-0" />
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>
                  {i < 4 && <Separator className="my-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-24 mt-2 rounded-md" />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-5 w-16 mt-2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
