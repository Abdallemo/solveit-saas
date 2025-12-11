"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getBillingStatus,
  getTransferHistory,
  manageStripeAccount,
} from "@/features/payments/server/data";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { BillingStatusCardSkeleton } from "./BillingStatusCard.loading";

type BillingStatus = Awaited<ReturnType<typeof getBillingStatus>>;

export default function BillingStatusCard() {
  const { data: status, isLoading } = useQuery<BillingStatus>({
    queryKey: ["billingStatus"],
    queryFn: getBillingStatus,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const { mutateAsync } = useMutation({
    mutationFn: manageStripeAccount,
  });

  if (isLoading || !status) {
    return <BillingStatusCardSkeleton />;
  }

  const isReady = status.isPayoutsEnabled;
  const StatusIcon = isReady ? CheckCircle2 : AlertCircle;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Payout Account
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your payouts and account details
            </p>
          </div>
          {status.accountInfo?.country && (
            <Badge variant="outline" className="text-xs">
              {status.accountInfo.country}
            </Badge>
          )}
        </div>

        <Card
          className={`border transition-colors ${isReady ? "border-primary/20" : "border-destructive/20"}`}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`p-3 rounded-lg ${isReady ? "bg-primary/10" : "bg-destructive/10"}`}
                >
                  <StatusIcon
                    className={`h-6 w-6 ${isReady ? "text-primary" : "text-destructive"}`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold text-base ${isReady ? "text-foreground" : "text-destructive"}`}
                  >
                    {isReady ? "Payouts Active" : "Setup Incomplete"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-md">
                    {isReady
                      ? "Your account is verified and ready to receive payouts. Funds will be automatically transferred to your bank account."
                      : "Complete your account setup to enable payouts. Additional verification may be required."}
                  </p>
                </div>
              </div>
              <Button
                variant={isReady ? "outline" : "default"}
                className="gap-2 whitespace-nowrap"
                onClick={async () => {
                  await mutateAsync();
                }}
              >
                {isReady ? "Manage Account" : "Complete Setup"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BalanceCard
            label="Available Balance"
            amount={status.balance.available}
            currency="RM"
            icon={TrendingUp}
            accent="primary"
          />
          <BalanceCard
            label="Pending Balance"
            amount={status.balance.pending}
            currency="RM"
            icon={Clock}
            accent="primary"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <DetailRow
                icon={Building2}
                label="Business Name"
                value={status.accountInfo?.businessName || "Not provided"}
              />
              <Separator className="my-3" />
              <DetailRow
                icon={Building2}
                label="Bank Account"
                value={
                  status.accountInfo?.bankName
                    ? `${status.accountInfo.bankName} •••• ${status.externalAccountLast4}`
                    : "Not linked"
                }
              />
              <Separator className="my-3" />
              <DetailRow
                icon={Calendar}
                label="Payout Schedule"
                value={status.accountInfo?.payoutSchedule || "Manual"}
              />
              <Separator className="my-3" />
              <DetailRow
                icon={Mail}
                label="Support Email"
                value={status.accountInfo?.supportEmail || "N/A"}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <TransferHistoryList />
    </>
  );
}

function BalanceCard({
  label,
  amount,
  currency,
  icon: Icon,
  accent,
}: {
  label: string;
  amount: number;
  currency: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "accent";
}) {
  return (
    <Card className="border border-border/50 hover:border-border transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p
              className={`text-3xl font-bold mt-2 ${accent === "primary" ? "text-foreground" : "text-foreground"}`}
            >
              {currency}
              {amount.toFixed(2)}
            </p>
          </div>
          <div
            className={`p-3 rounded-lg ${accent === "primary" ? "bg-primary/10" : "bg-accent/10"}`}
          >
            <Icon
              className={`h-5 w-5 ${accent === "primary" ? "text-primary" : "text-accent"}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground text-right">
        {value}
      </span>
    </div>
  );
}

export function TransferHistoryList() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ["transferHistory"],
    queryFn: getTransferHistory,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <Card className="mt-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent transfers</CardTitle>
          <span className="text-xs text-muted-foreground font-normal">
            Last 5 Transactions
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No transfer history yet
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {transfers.map((transfer, index) => (
              <div
                key={transfer.id}
                className={`flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors ${
                  index !== 0 ? "" : ""
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <TransferStatusIcon status={transfer.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Transfer to Bank
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transfer.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-foreground">
                    {transfer.currency} {transfer.amount.toFixed(2)}
                  </p>
                  <Badge variant="success" className={`text-xs mt-1`}>
                    {transfer.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TransferStatusIcon({ status }: { status: string }) {
  if (status === "failed") {
    return (
      <div className="p-2 rounded-full bg-destructive/10">
        <XCircle className="h-4 w-4 text-destructive" />
      </div>
    );
  }
  return (
    <div className="p-2 rounded-full bg-primary/10">
      <CheckCircle2 className="h-4 w-4 text-primary" />
    </div>
  );
}
