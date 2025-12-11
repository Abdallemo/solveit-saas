"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="w-full h-full px-5">
      <header className="flex justify-between items-center mb-9 pt-4">
        <div>
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  disabled
                  className="flex-1 md:flex-none flex justify-between items-center px-6 py-3 rounded-xl opacity-50 bg-transparent"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </Button>
              ))}
              <Badge variant={"success"} className="rounded-full opacity-50">
                <Skeleton className="h-4 w-16" />
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Active Tasks Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-24 mb-2" />
            <Skeleton className="h-5 w-48 mb-4" />
            <Skeleton className="w-full h-40" />
          </CardContent>
        </Card>

        {/* Monthly Earnings Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-56 mb-4" />
            <Skeleton className="w-full h-40" />
          </CardContent>
        </Card>

        {/* Mentorship Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-16 mb-2" />
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="w-full h-40" />
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <Card key={idx}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>
                  <Skeleton className="h-6 w-48" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-24" />
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
