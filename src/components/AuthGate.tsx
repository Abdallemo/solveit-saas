"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Lock,
  LogIn,
  CreditCard,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { MentorError } from "@/lib/Errors";
import { upgradeSolverToPlus } from "@/features/subscriptions/server/action";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMutation } from "@tanstack/react-query";

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
  const { user } = useCurrentUser();
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Card className="max-w-md text-center shadow-xl border rounded-2xl p-8">
        <div className="flex justify-center mb-4">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">
          Solver++ Subscription Required
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Unlock mentorship features by upgrading to Solver++.
        </p>

        <ul className="text-left text-sm text-muted-foreground mt-4 space-y-2">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> List yourself as a
            Mentor
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> Get Reviews from
            Students
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> Priority Job Matching
          </li>
        </ul>

        <Button
          className="w-full mt-6"
          onClick={async () => {
            await upgradeSolverToPlus(user?.id!);
          }}>
          Upgrade to Solver++
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          <a href="/pricing" className="underline">
            Learn more
          </a>
        </p>
      </Card>
    </div>
  );
}

export function BillingGate({ action }: { action: () => Promise<void> }) {
  const { isPending } = useMutation({
    mutationFn: action,
  });
  return (
    <div className="w-full h-full flex flex-col justify-center items-center backdrop-blur-md p-4">
      <Card className="max-w-lg text-center shadow-2xl border rounded-3xl p-8 bg-background/95 backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            <div className="relative bg-primary/10 p-4 rounded-full">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-balance">
          Connect Your Stripe Account
        </h2>
        <p className="text-muted-foreground mb-6 text-balance leading-relaxed">
          Link your Stripe account to start accepting payments and unlock all
          platform features. It only takes a few seconds to get started.
        </p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Secure & encrypted connection</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Industry-standard security</span>
          </div>
        </div>

        <Button
          disabled={isPending}
          className="w-full mt-2 h-12 text-base font-medium group"
          onClick={action}>
          {isPending && <Loader2 className="animate-spin" />}
          <span>Connect Stripe Account</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <a
            href="/pricing"
            className="underline hover:text-foreground transition-colors">
            View Pricing
          </a>
          <span>•</span>
          <a
            href="/help"
            className="underline hover:text-foreground transition-colors">
            Need Help?
          </a>
        </div>
      </Card>
    </div>
  );
}
