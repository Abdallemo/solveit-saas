"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskLoading() {
  return (
    <div className="flex flex-col px-6 py-8 gap-4 overflow-x-hidden w-full h-full">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Badge variant="outline">
          <Skeleton className="h-4 w-10" />
        </Badge>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Skeleton className="h-10 flex-1" />
          <Button disabled className="shrink-0">
            <Skeleton className="h-4 w-16" />
          </Button>
        </div>

        <div className="sm:flex gap-2 items-center sm:w-fit">
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="h-[670px] max-h-[670px]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>

              <CardContent className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>

                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>

              <CardFooter className="flex gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
