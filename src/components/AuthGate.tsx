"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { MentorError } from "@/lib/Errors";
import { upgradeSolverToPlus } from "@/features/subscriptions/server/action";
import useCurrentUser from "@/hooks/useCurrentUser";

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
            <CardDescription className="mt-2">
              Please sign in to access this page
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" asChild>
            <Link href={"/login"}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Redirecting you to sign in...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
export function MentorGate() {
  const {user} = useCurrentUser()
  return (
    <Card className="max-w-md mx-auto mt-20 text-center shadow-xl border rounded-2xl p-8">
      <div className="flex justify-center mb-4">
        <Lock className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold">Solver++ Subscription Required</h2>
      <p className="text-sm text-muted-foreground mt-2">
        Unlock mentorship features by upgrading to Solver++.
      </p>

      <ul className="text-left text-sm text-muted-foreground mt-4 space-y-2">
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" /> List yourself as a Mentor
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" /> Get Reviews from Students
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" /> Priority Job Matching
        </li>
      </ul>

      <Button className="w-full mt-6" onClick={async()=>{
        await upgradeSolverToPlus(user?.id!)
      }}>Upgrade to Solver++</Button>
      <p className="text-xs text-muted-foreground mt-2">
        <a href="/pricing" className="underline">
          Learn more
        </a>
      </p>
    </Card>
  );
}
