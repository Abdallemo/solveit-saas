import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MentorProfileLoading() {
  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mentor Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your mentor profile and availability for mentees
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Avatar */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex justify-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Premium Badge */}
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-36 rounded-full" />
                </div>

                {/* Profile Status */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex flex-col space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                </div>

                {/* Profile Overview */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>

                {/* Preview Button */}
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title & Specialization */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Bio & Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-[120px] w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>

                {/* Rate per hour */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Available Times */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-32" />
                  </div>

                  {/* Time Slot 1 */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-10" />
                  </div>

                  {/* Time Slot 2 */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-10" />
                  </div>

                  {/* Current Availability */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-32 rounded-full" />
                      <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Skeleton className="h-10 flex-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
