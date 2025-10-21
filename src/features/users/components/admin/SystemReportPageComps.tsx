"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useQueryParam from "@/hooks/useQueryParms";
import { toYMD } from "@/lib/utils";
import { subDays } from "date-fns";
import {
  ChevronDownIcon,
  ClipboardList,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Flag,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

type aiFlagsDataType = {
  date: string;
  flags: number;
};
type taskCategoriesDataType = {
  name: string;
  value: number;
};
type userGrowthDataTyoe = {
  month: string;
  users: number;
};
type revenueDataType = {
  month: string;
  revenue: number;
};

const userGrowthConfig = {
  users: {
    label: "Users",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const revenueConfig = {
  revenue: {
    label: "Revenue (RM)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const taskCategoriesConfig = {
  bugReports: {
    label: "Bug Reports",
    color: "var(--chart-1)",
  },
  featureRequests: {
    label: "Feature Requests",
    color: "var(--chart-2)",
  },
  support: {
    label: "Support",
    color: "var(--chart-3)",
  },
  moderation: {
    label: "Moderation",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const aiFlagsConfig = {
  flags: {
    label: "AI Flags",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

type reportDataType = {
  id: string;
  name: string;
  description: string;
  lastGenerated: string;
};

export default function SystemReportsPage({
  reportsData,
  aiFlagsData,
  userGrowthData,
  revenueData,
  taskCategoriesData,
}: {
  reportsData: reportDataType[];
  aiFlagsData: aiFlagsDataType[];
  userGrowthData: userGrowthDataTyoe[];
  revenueData: revenueDataType[];
  taskCategoriesData: taskCategoriesDataType[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("all");
  const [from, setFrom] = useQueryParam("cat", "");
  const [to, setTo] = useQueryParam("to", "");

  const shouldShowUsers =
    reportType === "all" || reportType === "user-activity";
  const shouldShowTasks = reportType === "all" || reportType === "tasks";
  const shouldShowRevenue = reportType === "all" || reportType === "financial";
  const shouldShowAIFlags =
    reportType === "all" || reportType === "ai-moderation";

  const visibleStatsCount = [
    shouldShowUsers,
    shouldShowTasks,
    shouldShowRevenue,
    shouldShowAIFlags,
  ].filter(Boolean).length;
  const visibleChartsCount = [
    shouldShowUsers,
    shouldShowRevenue,
    shouldShowTasks,
    shouldShowAIFlags,
  ].filter(Boolean).length;

  const statsGridClass =
    visibleStatsCount === 1
      ? "grid gap-4 md:grid-cols-1"
      : visibleStatsCount === 2
      ? "grid gap-4 md:grid-cols-2"
      : visibleStatsCount === 3
      ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      : "grid gap-4 md:grid-cols-2 lg:grid-cols-4";

  const chartsGridClass =
    visibleChartsCount === 1
      ? "grid gap-4 md:grid-cols-1"
      : "grid gap-4 md:grid-cols-2";
  const handleGenerateReport = () => {
    setTo(Math.random().toString());
    setFrom(Math.random().toString());
  };
  const handleExportPDF = () => {};
  const handleExportExcel = () => {};
  const handleSearchChange = (value: string) => {};
  const handleViewReport = (reportId: string) => {};

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate and export analytical reports across the SolveIt platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Calendar22 />
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="md:w-56">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="user-activity">User Activity</SelectItem>
                <SelectItem value="ai-moderation">AI Moderation</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by keyword…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchChange(e.target.value);
              }}
              className="md:flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards Row */}
      <div className={statsGridClass}>
        {shouldShowUsers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">520</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        )}

        {shouldShowTasks && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-muted-foreground mt-1">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        )}

        {shouldShowRevenue && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">RM 9,900</div>
              <p className="text-xs text-muted-foreground mt-1">
                +21% from last month
              </p>
            </CardContent>
          </Card>
        )}

        {shouldShowAIFlags && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Flags</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground mt-1">
                -5% from last month
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className={chartsGridClass}>
        {/* User Growth Chart */}
        {shouldShowUsers && (
          <Card>
            <CardHeader>
              <CardTitle>User Growth Over Time</CardTitle>
              <CardDescription>
                Monthly user registration trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={userGrowthConfig}
                className="h-[300px] w-full">
                <LineChart accessibilityLayer data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {shouldShowRevenue && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Month</CardTitle>
              <CardDescription>Monthly revenue in RM</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={revenueConfig}
                className="h-[300px] w-full">
                <BarChart accessibilityLayer data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {shouldShowTasks && (
          <Card>
            <CardHeader>
              <CardTitle>Task Categories Distribution</CardTitle>
              <CardDescription>Breakdown of task types</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={taskCategoriesConfig}
                className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={taskCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value">
                    {taskCategoriesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`var(--chart-${(index % 5) + 1})`}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {shouldShowAIFlags && (
          <Card>
            <CardHeader>
              <CardTitle>AI Flags Trend</CardTitle>
              <CardDescription>Daily AI moderation flags</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={aiFlagsConfig}
                className="h-[300px] w-full">
                <AreaChart accessibilityLayer data={aiFlagsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="flags"
                    stroke="var(--color-flags)"
                    fill="var(--color-flags)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
          <CardDescription>
            Available system reports and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Last Generated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsData.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {report.description}
                  </TableCell>
                  <TableCell>{report.lastGenerated}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReport(report.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground py-4">
        Reports are generated based on system activity logs and user
        transactions.
      </div>
    </div>
  );
}

export function Calendar22() {
  const today = new Date();

  const initialRange: DateRange = {
    from: subDays(new Date(), 30),
    to: today,
  };

  const [open, setOpen] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialRange
  );
  const [isRangeComplete, setIsRangeComplete] = useState(true);

  useEffect(() => {
    if (isRangeComplete && dateRange?.from && dateRange?.to) {
      console.log(
        `Final Range Selected/Initialized (Triggering Action):from=${toYMD(
          dateRange.from
        )} to=${toYMD(dateRange.to)}`
      );
    }
  }, [isRangeComplete, dateRange]);

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    const complete = range && range.from && range.to;
    setIsRangeComplete(!!complete);
    if (isRangeComplete && dateRange?.from && dateRange?.to) {
      // setFrom(toYMD(range?.from!));
      // setTo(toYMD(range?.to!));
    }
  };

  const getDisplayText = () => {
    if (!dateRange || !dateRange.from) {
      return "Select date range";
    }
    const start = dateRange.from.toLocaleDateString();
    if (!dateRange.to) {
      return `${start} - ...`;
    }
    const end = dateRange.to.toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-64 justify-between font-normal">
            {getDisplayText()}
            <ChevronDownIcon className="h-4 w-4 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            defaultMonth={today}
            numberOfMonths={2}
            className="rounded-lg border shadow-sm"
            hidden={{ after: today }}
            endMonth={today}
            // Optional: Limit the maximum range size to prevent accidental massive queries
            max={90}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
