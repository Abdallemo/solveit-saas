"use client";

import { Wallet, Info, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WalletDropdownMenu({pending,availabel}:{pending:number,availabel:number}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-8 relative bg-transparent">
          <Wallet className="size-5"/>
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
              <div className="text-lg font-semibold">RM{pending}</div>
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
                RM{availabel}
              </div>
              <Button size="sm" className="w-full h-7 text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Withdraw
              </Button>
            </div>
          </Card>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
