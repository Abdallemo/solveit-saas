import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserManagementSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-row justify-between w-full">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-72 mb-2" />
            <Skeleton className="h-7 w-80" />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Poster</TableHead>
              <TableHead>Poster Email</TableHead>
              <TableHead>Refund Reason</TableHead>
              <TableHead>Refund Status</TableHead>
              <TableHead>Solver</TableHead>
              <TableHead>Solver Email</TableHead>
              <TableHead>Refunded At</TableHead>
              <TableHead>Task Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="size-6 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[130px] rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-5 w-15" />
        <Skeleton className="h-5 w-15" />
      </div>
    </div>
  );
}
