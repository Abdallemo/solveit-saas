import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function UserPreferecesSkeleton() {
  return (
    <main className="flex-1 p-8 flex justify-center" suppressHydrationWarning>
      <div className="max-w-3xl w-full p-10">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-md animate-pulse" />
            <Skeleton className="h-5 w-full max-w-xl rounded-md animate-pulse" />
          </div>

          {/* Profile Information Section */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-40 rounded-md animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24 rounded-md animate-pulse" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24 rounded-md animate-pulse" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-5 w-20 rounded-md animate-pulse" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-16 rounded-md animate-pulse" />
              <Skeleton className="h-24 w-full rounded-md animate-pulse" />
            </div>
          </div>

          {/* Divider */}
          <Skeleton className="h-[1px] w-full bg-gray-200 rounded-full animate-pulse" />

          {/* Account Identities Section */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-40 rounded-md animate-pulse" />
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-32 rounded-md animate-pulse" />
                <Skeleton className="h-4 w-48 rounded-md animate-pulse" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <Skeleton className="h-[1px] w-full bg-gray-200 rounded-full animate-pulse" />

          {/* Notification Settings Section */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-48 rounded-md animate-pulse" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm animate-pulse" />
                  <Skeleton className="h-5 w-36 rounded-md animate-pulse" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm animate-pulse" />
                  <Skeleton className="h-5 w-36 rounded-md animate-pulse" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Divider */}
          <Skeleton className="h-[1px] w-full bg-gray-200 rounded-full animate-pulse" />

          {/* Appearance Section */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-32 rounded-md animate-pulse" />
            <Skeleton className="h-5 w-full max-w-lg rounded-md animate-pulse" />

            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-24 w-full rounded-md border-2 animate-pulse" />
                  <Skeleton className="h-5 w-12 mx-auto rounded-md animate-pulse" />
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Skeleton className="h-4 w-full max-w-md rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
