"use client";

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
import { goClientApi } from "@/lib/go-api/client";
import { useMutation } from "@tanstack/react-query";
import { Activity, FileJson, Play, Server, XCircle } from "lucide-react";
import { useState } from "react";

const TARGET_ENDPOINT = "/protected";
const TARGET_METHOD = "GET";

type ApiResponse = {
  status: number;
  body: string;
};

export default function GoApiSandbox() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const { mutate, isPending, data, error, isError, isSuccess } = useMutation<
    ApiResponse,
    Error
  >({
    mutationFn: async () => {
      addLog(`Initializing ${TARGET_METHOD} request...`);
      addLog(`Target: ${TARGET_ENDPOINT}`);

      const res = await goClientApi.request(TARGET_ENDPOINT, {
        method: TARGET_METHOD,
      });

      if (res.error) {
        throw new Error(`HTTP ${res.status}: ${res.error}`);
      }

      const body = JSON.stringify(res.data, null, 2);

      return { status: res.status, body };
    },
    onSuccess: (data) => addLog(`Success: HTTP ${data.status}`),
    onError: (err) => addLog(`Failed: ${err.message}`),
  });

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl bg-card text-card-foreground border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">API Sandbox</CardTitle>
              <CardDescription className="font-mono text-xs mt-1">
                {TARGET_METHOD} {TARGET_ENDPOINT}
              </CardDescription>
            </div>
          </div>

          <Badge
            variant={
              isSuccess ? "default" : isError ? "destructive" : "outline"
            }
            className="px-4 py-1 text-xs font-semibold uppercase tracking-wider transition-all"
          >
            {isPending
              ? "Running..."
              : isError
                ? "Error"
                : isSuccess
                  ? "Success"
                  : "Idle"}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Action
            </h3>
            <Button
              size="lg"
              className="w-full font-semibold shadow-md"
              onClick={() => mutate()}
              disabled={isPending}
            >
              {isPending ? (
                <Activity className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4 fill-current" />
              )}
              {isPending ? "Executing..." : "Trigger Request"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center pt-2">
              Authenticated via{" "}
              <code className="bg-muted px-1 rounded">GoApiClient</code>
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Live Logs
            </h3>
            <div className="rounded-md border bg-muted/30 h-[200px] flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 p-3">
                {logs.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">
                    Waiting for triggers...
                  </span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {logs.map((log, i) => (
                      <div
                        key={i}
                        className="text-[10px] font-mono border-l-2 border-primary/30 pl-2 text-muted-foreground"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col h-full min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <FileJson className="w-4 h-4" /> Response Body
            </h3>
            {data?.status && (
              <Badge variant="secondary" className="font-mono text-[10px]">
                Status: {data.status}
              </Badge>
            )}
          </div>

          <div
            className={`flex-1 rounded-md border bg-muted/10 relative overflow-hidden group ${
              isError ? "border-destructive/50 bg-destructive/5" : ""
            }`}
          >
            <ScrollArea className="h-full w-full max-h-[400px]">
              <div className="p-4">
                {isError ? (
                  <div className="flex items-start gap-3 text-destructive">
                    <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Request Failed</p>
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {error?.message}
                      </pre>
                    </div>
                  </div>
                ) : data ? (
                  <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                    {data.body}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground/50 gap-2">
                    <Activity className="w-8 h-8 opacity-20" />
                    <span className="text-xs">No response data yet</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
