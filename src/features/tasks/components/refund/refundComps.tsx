"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefundStatusEnumType } from "@/drizzle/schemas";
import { refundPoster } from "@/features/payments/server/action";
import { useMutation } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { allDisputesType } from "../../server/task-types";
import { GetRefundStatusBadge } from "../taskStatusBadge";
function NewRefundColumns({
  handleOpenDialog,
}: {
  handleOpenDialog: (dispute: allDisputesType) => void;
}): ColumnDef<allDisputesType>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "posterName",
      header: "Poster",
    },
    {
      accessorKey: "posterEmail",
      header: "Poster Email",
    },
    {
      accessorKey: "refundReason",
      header: "Refund Reason",
    },
    {
      accessorKey: "refundStatus",
      header: "Refund Status",
      cell: ({ row }) => {
        const status = row.getValue("refundStatus");
        return GetRefundStatusBadge(status as RefundStatusEnumType);
      },
    },
    {
      accessorKey: "solverName",
      header: "Solver",
    },
    {
      accessorKey: "solverEmail",
      header: "Solver Email",
    },
    {
      accessorKey: "refundedAt",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }>
            Refunded At <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return new Date(row.getValue("refundedAt")).toLocaleTimeString(
          undefined,
          {
            day: "2-digit",
            hour: "2-digit",
            month: "2-digit",
            minute: "2-digit",
            year: "numeric",
          }
        );
      },
    },
    {
      accessorKey: "taskPrice",
      header: "Task Price",
    },
    {
      id: "Actions",
      cell: ({ row }) => {
        const dispute = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(dispute.id);
                  toast.info("copie to clipboard");
                }}>
                Copy Dispute ID
              </DropdownMenuItem>
              {dispute.refundStatus === "PENDING" && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                  onClick={() => handleOpenDialog(dispute)}>
                  Accept Refund
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Solver</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

interface RefundTableProps {
  data: allDisputesType[];
}
export function RefundTable({ data }: RefundTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<allDisputesType | null>(
    null
  );
  const [confirmInput, setConfirmInput] = useState("");
  const { mutateAsync: issueRefund, isPending: isRefunding } = useMutation({
    mutationFn: refundPoster,
    onError: (e) => toast.error(e.message),
    onSuccess:()=>toast.success("Successfully refuned")
  });
  const columns = useMemo(() => {
    const handleOpenDialog = (dispute: allDisputesType) => {
      setSelectedRefund(dispute);
      setOpen(true);
      setConfirmInput("");
    };
    return NewRefundColumns({ handleOpenDialog });
  }, []);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={
            (table.getColumn("posterEmail")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("posterEmail")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
      {selectedRefund && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Accept This Refund?</AlertDialogTitle>
              <AlertDialogDescription className="text-foreground">
                By accepting this refund, you confirm that you are in favor of
                the poster. This action will mark the task as refunded and issue
                a refund or task re-open to the poster.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRefunding} className={``}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isRefunding}
                onClick={async () =>
                  await issueRefund(selectedRefund.taskPaymentId!)
                }
                className={`${"cursor-not-allowed"} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 cursor-pointer`}>
                {isRefunding && <Loader2 className="animate-spin" />}
                Yes, Accept Solution
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
