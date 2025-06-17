import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, LogIn } from "lucide-react"
import Link from "next/link"

export default function AuthGate() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl border-white/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription className="mt-2">Please sign in to access this page</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" asChild>
            <Link href={'/login'}><LogIn className="w-4 h-4 mr-2" />
            Sign In</Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">Redirecting you to sign in...</p>
        </CardContent>
      </Card>
    </div>
  )
}
