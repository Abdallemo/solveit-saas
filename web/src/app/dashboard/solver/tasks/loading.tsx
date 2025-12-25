"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="flex flex-col px-6 py-8 gap-4 overflow-x-hidden w-full h-full">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-10" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[200px]" />
      </div>

      <div className="h-[670px] max-h-[670px]">
        <TaskCardsSkeleton />
      </div>

      <div className="flex justify-center mt-4 gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function TaskCardsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
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
  );
}
