"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Zap, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const loadingSteps = [
  {
    message: "Creating your workspace...",
    icon: Loader2,
    duration: 2000,
    progress: 25,
  },
  {
    message: "Enhancing your experience...",
    icon: Sparkles,
    duration: 2500,
    progress: 50,
  },
  {
    message: "Making your experience better...",
    icon: Zap,
    duration: 2000,
    progress: 75,
  },
  {
    message: "Almost ready...",
    icon: Loader2,
    duration: 1500,
    progress: 90,
  },
  {
    message: "Welcome to your workspace!",
    icon: CheckCircle,
    duration: 1000,
    progress: 100,
  },
];

export default function WorkspaceOnboarding({
  workspaceId,
}: {
  taskId: string;
  workspaceId: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentStep >= loadingSteps.length) {
      setIsComplete(true);
      // setTimeout(() => {
      //   router.push('/workspace')
      // }, 1000)
      return;
    }

    const currentStepData = loadingSteps[currentStep];

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const target = currentStepData.progress;
        const increment = (target - prev) / 20;
        return prev + increment;
      });
    }, 50);

    const stepTimer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, currentStepData.duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimer);
    };
  }, [currentStep])

  useEffect(() => {
    if (isComplete) {
      const redirectTimeout = setTimeout(() => {
        router.push(`/dashboard/solver/workspace/${workspaceId}`);
      }, 1200); // optional delay for "Welcome" message

      return () => clearTimeout(redirectTimeout);
    }
  }, [isComplete, workspaceId, router])

  const currentStepData =
    loadingSteps[currentStep] || loadingSteps[loadingSteps.length - 1];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-2xl border-white/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center space-y-8">
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Setting Up Your Workspace
              </h1>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gray-100/50 dark:bg-gray-800/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <IconComponent
                    className={`w-10 h-10 text-gray-600 dark:text-gray-400 ${
                      IconComponent === Loader2
                        ? "animate-spin"
                        : IconComponent === CheckCircle
                        ? "text-green-600 dark:text-green-400"
                        : "animate-pulse"
                    }`}
                  />
                </div>

                <div className="absolute inset-0 rounded-full border-2 border-gray-200/50 dark:border-gray-700/50 animate-ping opacity-20"></div>
                <div className="absolute inset-2 rounded-full border border-gray-300/50 dark:border-gray-600/50 animate-ping opacity-30 animation-delay-150"></div>
              </div>

              <div className="space-y-4">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 transition-all duration-500 ease-in-out">
                  {currentStepData.message}
                </p>

                <div className="space-y-2">
                  <Progress
                    value={progress}
                    className="h-2 bg-gray-200/50 dark:bg-gray-700/50"
                  />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                {loadingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep
                        ? "bg-gray-600 dark:bg-gray-400"
                        : "bg-gray-300/50 dark:bg-gray-600/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {isComplete && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="text-green-600 dark:text-green-400">
                  <CheckCircle className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Redirecting to your workspace...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
