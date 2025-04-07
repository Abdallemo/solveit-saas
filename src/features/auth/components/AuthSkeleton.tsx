import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuthSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-6">

          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Login button */}
              <Skeleton className="h-10 w-full" />

              {/* Social login buttons */}
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>

          {/* Register form (hidden by default) */}
          <div className="hidden">
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Register button */}
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Right side - Gradient Background */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-purple-900 via-purple-600 to-blue-400" />
    </div>
  )
}

