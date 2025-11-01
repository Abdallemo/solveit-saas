import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getModeratorAssignedDisputes } from "@/features/tasks/server/data";
import Link from "next/link";
function getStatusVariant(
  status: string | null
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "REFUNDED":
      return "default";
    case "PENDING":
    case "PENDING_POSTER_ACTION":
      return "secondary";
    case "FAILED":
    case "REJECTED":
      return "destructive";
    case "PROCESSING":
      return "outline";
    default:
      return "outline";
  }
}
type Dispute = {
  id: string
  createdAt: Date | null
  updatedAt: Date | null
  paymentId: string
  taskId: string
  refundReason: string | null
  refundStatus: "FAILED" | "REFUNDED" | "PENDING" | "PROCESSING" | "REJECTED" | "PENDING_POSTER_ACTION" | null
  moderatorId: string | null
  refundedAt: Date | null
  stripeRefundId: string | null
}

function formatStatus(status: string | null): string {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function page() {
  const disputes = await getModeratorAssignedDisputes();
  if (!disputes || disputes.length <= 0) {
    return (
      <main className="flex flex-col px-6 py-8 gap-4 w-full h-full">
        <div className=" flex items-center justify-center text-muted-foreground py-24 border rounded-md bg-muted/30">
          You dont have any Disputes Assigned Yet
        </div>
      </main>
    );
  }
  return (
    <main className="flex flex-col px-6 py-8 gap-4 w-full h-full">
      {disputes.map((dispute) => (
        <Card key={dispute.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle>Dispute #{dispute.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  Task ID: {dispute.taskId.slice(0, 8)} • Payment ID:{" "}
                  {dispute.paymentId.slice(0, 8)}
                </CardDescription>
              </div>
              <Badge variant={getStatusVariant(dispute.refundStatus)}>
                {formatStatus(dispute.refundStatus)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {dispute.refundReason && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Reason:
                  </span>{" "}
                  <span className="text-foreground">
                    {dispute.refundReason}
                  </span>
                </div>
              )}
              <div className="flex gap-4 text-muted-foreground">
                {dispute.createdAt && (
                  <span>Created {dispute.createdAt.toLocaleDateString()}</span>
                )}
                {dispute.refundedAt && (
                  <span>
                    Refunded {dispute.refundedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href={`/dashboard/moderator/disputes/${dispute.id}`}>View Full Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </main>
  );
}
