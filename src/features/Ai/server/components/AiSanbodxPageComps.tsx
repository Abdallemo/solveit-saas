"use client";

import RuleSandBoxLoading from "@/app/dashboard/admin/ai/rule-sandbox/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminAiSandboxTestsType,
  openaiResAdminType,
  saveAdminAiSandboxTests,
  validateContentWithAi,
} from "@/features/Ai/server/action";
import { getAllAiRulesQuery } from "@/features/tasks/client/queries";
import { useAutoSave } from "@/hooks/useAutoDraftSave";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, PlayCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AIRuleSandboxPage({
  adminAiSandboxTests,
}: {
  adminAiSandboxTests: AdminAiSandboxTestsType;
}) {
  const [sampleMessage, setSampleMessage] = useState(
    adminAiSandboxTests ? adminAiSandboxTests.content : "",
  );
  const [result, setResult] = useState<openaiResAdminType | null>(null);
  const {
    data: allAiRules,
    isLoading,
    error: AiRulesQueryError,
  } = useQuery(getAllAiRulesQuery());
  const { mutateAsync: testContentWithAi, isPending: isLoadings } = useMutation(
    {
      mutationFn: async (content: string) => {
        return await validateContentWithAi({
          content: content,
          adminMode: true,
        });
      },
    },
  );
  useAutoSave({
    autoSaveFn: saveAdminAiSandboxTests,
    autoSaveArgs: [
      {
        content: sampleMessage,
        autoSave: true,
      },
    ],
    delay: 700,
    disabled: isLoading || !allAiRules,
  });

  if (AiRulesQueryError) {
    throw AiRulesQueryError;
  }
  if (isLoading || !allAiRules) {
    return <RuleSandBoxLoading />;
  }
  const handleTest = async () => {
    if (!sampleMessage.trim()) return;
    try {
      const [result] = await Promise.all([
        testContentWithAi(sampleMessage),
        saveAdminAiSandboxTests({
          content: sampleMessage,
        }),
      ]);
      setResult(result);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("failed to request," + error.message);
        console.error(error);
      }
    }
  };

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
                <CardTitle>Sample Message</CardTitle>
                <CardDescription>
                  Enter a test message to check against your moderation rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="I'm making a game, and my model looks weird..."
                  value={sampleMessage}
                  onChange={(e) => setSampleMessage(e.target.value)}
                  className="min-h-[200px]  h-[350px] max-h-[350px] "
                />
                <Button
                  onClick={handleTest}
                  disabled={!sampleMessage.trim() || isLoadings}
                  className="w-full"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  {isLoadings ? "Testing..." : "Test Rules"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Rules</CardTitle>
                <CardDescription>
                  Currently configured moderation rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ScrollArea className="h-40">
                    {allAiRules.map((rule, index) => (
                      <div key={rule.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-col gap-2 items-center">
                                <h4 className="text-sm font-bold">
                                  Rule Name:
                                </h4>
                                <span className="text-sm text-muted-foreground">
                                  {rule.rule}
                                </span>
                              </div>
                              <Badge
                                variant={
                                  rule.isActive ? "success" : "secondary"
                                }
                                className="text-xs"
                              >
                                {rule.isActive ? "Active" : "Disabled"}
                              </Badge>
                            </div>
                            <div className="flex-col gap-2 items-center">
                              <h4 className="text-sm font-bold">
                                Rule Description:
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {rule.description}
                              </span>
                            </div>
                          </div>
                        </div>
                        {index < allAiRules.length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6 ">
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  Moderation check results will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-border ">
                    <div className="text-center">
                      <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        Run a test to see results
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert
                      className="flex"
                      variant={result.violatesRules ? "destructive" : "default"}
                    >
                      <div className="flex items-start gap-3">
                        {result.violatesRules ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        <div className="">
                          <h4 className="font-semibold">
                            {result.violatesRules
                              ? "Rule Violation Detected"
                              : "All Clear"}
                          </h4>
                          <AlertDescription className="mt-1">
                            <p>
                              {result.violatesRules
                                ? "This message violates one or more moderation rules"
                                : "This message passes all moderation checks"}
                            </p>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                    <div className="flex justify-between items-center rounded-md border p-3 bg-card-foreground/5">
                      <h4 className="text-sm font-medium text-foreground">
                        AI Confidence Score
                      </h4>
                      <span className="text-base font-bold text-primary">
                        {result.confidenceScore.toFixed(1)} / 10
                      </span>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        Explanation
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {result.reason}
                      </p>
                    </div>

                    {result.triggeredRules.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">
                          Triggered Rules
                        </h4>
                        <div className="space-y-2">
                          {result.triggeredRules.map((rule, index) => (
                            <div
                              key={index}
                              className="rounded-md border border-destructive/50 bg-destructive/10 p-3"
                            >
                              <p className="text-sm text-foreground leading-relaxed">
                                - {rule}.
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => setResult(null)}
                      className="w-full"
                    >
                      Clear Results
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
