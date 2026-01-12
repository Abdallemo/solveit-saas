"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PaymentStatusType } from "@/drizzle/schemas";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { paymentType } from "../server/action";

export function GetPaymentStatusBadge(status: PaymentStatusType) {
  switch (status) {
    case "SUCCEEDED":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Succeeded
        </Badge>
      );
    case "HOLD":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          On Hold
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Refunded
        </Badge>
      );
    case "CANCELED":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-500">
          Cancled
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          Failed
        </Badge>
      );

    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

function NewPaymentColumns(): ColumnDef<paymentType>[] {
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
      accessorKey: "name",
      header: "Payer Name",
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback>
                {payment.name?.split("")[0].toUpperCase()}
              </AvatarFallback>
              <AvatarImage src={payment.image!}></AvatarImage>
            </Avatar>
            <p className="text-md">{payment.name}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Poster Email",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return GetPaymentStatusBadge(status as PaymentStatusType);
      },
    },
    {
      accessorKey: "purpose",
      header: "Payment Purpose",
    },
    {
      accessorKey: "releaseDate",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Release Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const payment = row.original;
        if (!payment.releaseDate) return "Not yet released";
        return new Date(row.getValue("releaseDate")).toLocaleTimeString(
          undefined,
          {
            day: "2-digit",
            hour: "2-digit",
            month: "2-digit",
            minute: "2-digit",
            year: "numeric",
          },
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleTimeString(
          undefined,
          {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        );
      },
    },
    {
      id: "Actions",
      cell: ({ row }) => {
        const payment = row.original;
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
                  navigator.clipboard.writeText(payment.id);
                  toast.info("copied to clipboard");
                }}
              >
                Copy Payment ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

interface PaymentTableProps {
  data: paymentType[];
}

export function PaymentTable({ data }: PaymentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(() => {
    return NewPaymentColumns();
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
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
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
                    }
                  >
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
                          header.getContext(),
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
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
