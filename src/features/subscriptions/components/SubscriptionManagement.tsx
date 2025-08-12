"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  getFilteredRowModel,
  type VisibilityState,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown, ChevronDown, Download } from "lucide-react"
import { toast } from "sonner"
import { Subscription } from "../server/action"


const formatAmount = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
  if (cancelAtPeriodEnd && status === "active") {
    return (
      <Badge variant="outline" className="text-orange-600 border-orange-600">
        Canceling
      </Badge>
    )
  }

  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Active
        </Badge>
      )
    case "trialing":
      return (
        <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
          Trial
        </Badge>
      )
    case "past_due":
      return <Badge variant="destructive">Past Due</Badge>
    case "canceled":
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-600">
          Canceled
        </Badge>
      )
    case "incomplete":
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          Incomplete
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export const subscriptionColumns: ColumnDef<Subscription>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => {
      const subscription = row.original
      return (
        <div className="space-y-1">
          <div className="font-medium">{subscription.customerName}</div>
          <div className="text-sm text-muted-foreground">{subscription.customerEmail}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "planName",
    header: "Plan",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("planName")}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const subscription = row.original
      return getStatusBadge(subscription.status, subscription.cancelAtPeriodEnd)
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const subscription = row.original
      return (
        <div>
          <div className="font-medium">{formatAmount(subscription.amount, subscription.currency)}</div>
          <div className="text-sm text-muted-foreground">per {subscription.interval}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "interval",
    header: "Billing Cycle",
    cell: ({ row }) => {
      const interval = row.getValue("interval") as string
      return (
        <Badge variant="outline" className="capitalize">
          {interval}ly
        </Badge>
      )
    },
  },
  {
    accessorKey: "currentPeriodStart",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Current Period
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const subscription = row.original
      return (
        <div className="space-y-1">
          <div className="text-sm">
            {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
          </div>
          {subscription.trialEnd && (
            <div className="text-xs text-muted-foreground">Trial ends: {formatDate(subscription.trialEnd)}</div>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const subscription = row.original

      const handleCancelSubscription = async (subscriptionId: string) => {
        // TODO: Implement Stripe API call to cancel subscription
        console.log("Canceling subscription:", subscriptionId)
        toast.success("Subscription canceled")
      }

      const handleReactivateSubscription = async (subscriptionId: string) => {
        // TODO: Implement Stripe API call to reactivate subscription
        console.log("Reactivating subscription:", subscriptionId)
        toast.success("Subscription reactivated")
      }

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
                navigator.clipboard.writeText(subscription.id)
                toast.success("Subscription ID copied to clipboard")
              }}
            >
              Copy subscription ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(subscription.customerId)
                toast.success("Customer ID copied to clipboard")
              }}
            >
              Copy customer ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View invoices</DropdownMenuItem>
            <DropdownMenuSeparator />
            {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
              <DropdownMenuItem className="text-red-600" onClick={() => handleCancelSubscription(subscription.id)}>
                Cancel subscription
              </DropdownMenuItem>
            )}
            {subscription.cancelAtPeriodEnd && (
              <DropdownMenuItem onClick={() => handleReactivateSubscription(subscription.id)}>
                Reactivate subscription
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface SubscriptionTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function SubscriptionTable<TData, TValue>({ columns, data }: SubscriptionTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

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
  })

  return (
    <div>
      <div className="flex items-center py-1">
        <Input
          placeholder="Filter customers..."
          value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("customerName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              Columns
              <ChevronDown className="ml-2 h-4 w-4" />
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}

// Mock data - replace with actual Stripe API calls
const Mocksubscription: Subscription[] = [
  {
    id: "sub_1234567890",
    customerId: "cus_1234567890",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    planName: "Pro Plan",
    status: "active",
    amount: 2999,
    currency: "usd",
    interval: "month",
    currentPeriodStart: "2024-01-01",
    currentPeriodEnd: "2024-02-01",
    cancelAtPeriodEnd: false,
  },
  {
    id: "sub_0987654321",
    customerId: "cus_0987654321",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    planName: "Enterprise Plan",
    status: "trialing",
    amount: 9999,
    currency: "usd",
    interval: "year",
    currentPeriodStart: "2024-01-15",
    currentPeriodEnd: "2025-01-15",
    cancelAtPeriodEnd: false,
    trialEnd: "2024-02-15",
  },
  {
    id: "sub_1122334455",
    customerId: "cus_1122334455",
    customerName: "Bob Johnson",
    customerEmail: "bob@example.com",
    planName: "Basic Plan",
    status: "past_due",
    amount: 999,
    currency: "usd",
    interval: "month",
    currentPeriodStart: "2024-01-10",
    currentPeriodEnd: "2024-02-10",
    cancelAtPeriodEnd: false,
  },
  {
    id: "sub_5566778899",
    customerId: "cus_5566778899",
    customerName: "Alice Brown",
    customerEmail: "alice@example.com",
    planName: "Pro Plan",
    status: "canceled",
    amount: 2999,
    currency: "usd",
    interval: "month",
    currentPeriodStart: "2024-01-05",
    currentPeriodEnd: "2024-02-05",
    cancelAtPeriodEnd: true,
  },
]

export function SubscriptionManagement({subscription}:{subscription?:Subscription[]}) {
  const [subscriptions] = useState<Subscription[]>(subscription??[])

  return (
    <div className="container mx-auto py-6 px-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">Manage and monitor all customer subscriptions</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {subscriptions.filter((s) => s.status === "active" && !s.cancelAtPeriodEnd).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trialing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {subscriptions.filter((s) => s.status === "trialing").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {subscriptions.filter((s) => s.status === "past_due").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>A list of all customer subscriptions and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionTable columns={subscriptionColumns} data={subscriptions} />
        </CardContent>
      </Card>
    </div>
  )
}
