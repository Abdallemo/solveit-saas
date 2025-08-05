import { Badge } from "@/components/ui/badge";
import { RefundStatusEnumType, TaskStatusType } from "@/drizzle/schemas";
import { AlertCircle, CheckCircle, Clock, Eye } from "lucide-react";

export default function GetStatusBadge(status: TaskStatusType) {
  switch (status) {
    case "OPEN":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Eye className="w-4 h-4"/>
          Open
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-4 h-4" />
          In Progress
        </Badge>
      );
    case "ASSIGNED":
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Assigned
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <AlertCircle className="w-4 h-4" />
          Submited
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <CheckCircle className="w-4 h-4" />
          Completed
        </Badge>
      );
    default:
      return <Badge variant="secondary"><Clock className="w-4 h-4" /> Unknown</Badge>;
  }
}
export function GetRefundStatusBadge(status: RefundStatusEnumType) {
  switch (status) {
    case "REFUNDED":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Refunded
        </Badge>
      );
    case "PROCESSING":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Processing
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Pending
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          Rejected
        </Badge>
      );
    
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}
