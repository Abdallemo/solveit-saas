import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, MoveLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-6">
              <FileQuestion className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
          <p className="text-muted-foreground">Oops! The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <Link href="/">
                <MoveLeft className="h-4 w-4" />
                Go back
              </Link>
            </Button>
            <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          If you believe this is an error, please contact support.
        </CardFooter>
      </Card>
    </div>
  )
}
