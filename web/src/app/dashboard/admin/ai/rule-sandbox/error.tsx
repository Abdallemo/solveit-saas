"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v0] AI Rule Sandbox Error:", error);
  }, [error]);

  return (
    <div className="w-full h-full p-6">
      <div className="mx-auto max-w-8xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            AI Rule Sandbox
          </h1>
          <p className="text-muted-foreground">
            Test your moderation rules safely before deploying them to
            production
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Loading AI Data</CardTitle>
                <CardDescription>
                  Something went wrong while loading the AI rule sandbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Failed to Load</AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p>
                      We encountered an error while loading the AI moderation
                      data.
                    </p>
                    {error.message && (
                      <p className="text-xs font-mono bg-destructive/10 p-2 rounded">
                        {error.message}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="mt-4 space-y-2">
                  <Button onClick={reset} className="w-full">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/dashboard/admin")}
                    className="w-full">
                    Back to Admin
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
                <CardDescription>Common issues and solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>Check your internet connection and try again</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    <span>
                      Verify that AI moderation services are properly configured
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Moderation check results will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
                  <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Unable to load test environment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
