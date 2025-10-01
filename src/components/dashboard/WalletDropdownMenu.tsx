"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWalletInfo } from "@/features/tasks/server/data";
import useCurrentUser from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Info, Wallet } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent } from "../ui/tooltip";

export default function WalletDropdownMenu() {
  const { user } = useCurrentUser();
  const { data, isFetching } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: () => getWalletInfo(user?.id!),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative h-9 w-9 rounded-full transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}>
          <Wallet className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4" />
            <span className="font-medium text-sm">Virtual Wallet</span>
          </div>

          <Card className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending</span>
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              </div>
              <div className="text-lg font-semibold">
                {isFetching ? (
                  <Skeleton className="h-2 w-2" />
                ) : (
                  <>RM{data?.pending}</>
                )}
              </div>
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Held until reviews done</span>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Available</span>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </div>
              <div className="text-lg font-semibold text-green-600">
                {isFetching ? (
                  <Skeleton className="h-2 w-2" />
                ) : (
                  <>RM{data?.available}</>
                )}
              </div>
              <Tooltip>
                {data?.available! <= 20 && (
                  <TooltipContent
                    align="end"
                    alignOffset={20}
                    className="bg-primary">
                    you can only withdraw more then RM20
                  </TooltipContent>
                )}

                <TooltipTrigger className="w-full">
                  <div className="w-full">
                    <Button
                      size="sm"
                      className="w-full h-7 text-xs"
                      disabled={data?.available! <= 20}>
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Withdraw
                    </Button>
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </div>
          </Card>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
