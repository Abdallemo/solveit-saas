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
import {
  aiFlagsDataQuery,
  revenueQuery,
  taskCategoriesQuery,
  userGrowthQuery,
} from "@/features/tasks/client/queries";
import useQueryParam from "@/hooks/useQueryParms";
import { toYMD } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import {
  ChevronDownIcon,
  ClipboardList,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Flag,
  // Assuming Loader2 is available from lucide-react as you mentioned
  Loader2,
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

const LoadingStatsContent = () => (
  <CardContent>
    <div className="text-2xl font-bold flex items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      Fetching latest metrics...
    </p>
  </CardContent>
);

const LoadingChartContent = () => (
  <CardContent className="flex items-center justify-center h-[300px]">
    <div className="text-muted-foreground flex flex-col items-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="mt-2">Loading Chart...</span>
    </div>
  </CardContent>
);

export default function SystemReportsPage({
  reportsData,
}: {
  reportsData: reportDataType[];
}) {
  const today = new Date();
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("all");
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

  const [from, setFrom] = useQueryParam("from", toYMD(subDays(today, 30)));
  const [to, setTo] = useQueryParam("to", toYMD(today));
  // const [stateFrom, setStateFrom] = useState(toYMD(subDays(today, 30)));
  // const [stateTo, setStateTo] = useState(toYMD(today));

  const { data: userGrowthData, isLoading: isUserGrowthLoading } = useQuery(
    userGrowthQuery({ from: from, to: to, enabled: shouldShowUsers })
  );
  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    status,
    error,
  } = useQuery(
    revenueQuery({ from: from, to: to, enabled: shouldShowRevenue })
  );
  const { data: taskCategoriesData, isLoading: isTaskCategoriesLoading } =
    useQuery(
      taskCategoriesQuery({ from: from, to: to, enabled: shouldShowTasks })
    );
  const { data: aiFlagsData, isLoading: isAiFlagsDataLoading } = useQuery(
    aiFlagsDataQuery({ from: from, to: to, enabled: shouldShowTasks })
  );

  const aggregatedTaskData = taskCategoriesData
    ? Object.values(
        taskCategoriesData.reduce((acc, cur) => {
          const name = cur.name || "Unknown";
          if (!acc[name]) acc[name] = { name, value: 0 };
          acc[name].value += cur.taskCount ?? 0;
          return acc;
        }, {} as Record<string, { name: string; value: number }>)
      )
    : [];

  const dynamicTaskCategoriesConfig = aggregatedTaskData.reduce(
    (config, cat, index) => {
      config[cat.name] = {
        label: cat.name,
        color: `var(--chart-${(index % 5) + 1})`,
      };
      return config;
    },
    {} as Record<string, { label: string; color: string }>
  );

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

  const handleGenerateReport = () => {};
  const handleExportPDF = () => {};
  const handleExportExcel = () => {};
  const handleSearchChange = (value: string) => {};
  const handleViewReport = (reportId: string) => {};
  const totoalReven = revenueData
    ? revenueData.reduce(
        (accumulator, currentObject) =>
          accumulator + currentObject.totalRevenue,
        0
      )
    : 0;
  const totoalTask = taskCategoriesData
    ? taskCategoriesData.reduce(
        (accumulator, currentObject) => accumulator + currentObject.taskCount,
        0
      )
    : 0;
  const totoalUser = userGrowthData
    ? userGrowthData.reduce(
        (accumulator, currentObject) => accumulator + currentObject.users,
        0
      )
    : 0;
  const totoalAiFlags = aiFlagsData
    ? aiFlagsData.reduce(
        (accumulator, currentObject) => accumulator + currentObject.flags,
        0
      )
    : 0;

  return (
    <div className="w-full h-full p-6 space-y-6">
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Calendar22 setFrom={setFrom} setTo={setTo} />
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

      <div className={statsGridClass}>
        {shouldShowUsers && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            {isUserGrowthLoading ? (
              <LoadingStatsContent />
            ) : (
              <CardContent>
                <div className="text-2xl font-bold">
                  {userGrowthData ? totoalUser : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12% from last month
                </p>
              </CardContent>
            )}
          </Card>
        )}

        {shouldShowTasks && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            {isTaskCategoriesLoading ? (
              <LoadingStatsContent />
            ) : (
              <CardContent>
                <div className="text-2xl font-bold">
                  {taskCategoriesData ? totoalTask : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +8% from last month
                </p>
              </CardContent>
            )}
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
            {isRevenueLoading ? (
              <LoadingStatsContent />
            ) : (
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData ? "RM" + totoalReven : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +21% from last month
                </p>
              </CardContent>
            )}
          </Card>
        )}

        {shouldShowAIFlags && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Flags</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totoalAiFlags}</div>
              <p className="text-xs text-muted-foreground mt-1">
                -5% from last month
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className={chartsGridClass}>
        {shouldShowUsers && (
          <Card>
            <CardHeader>
              <CardTitle>User Growth Over Time</CardTitle>
              <CardDescription>
                Monthly user registration trends
              </CardDescription>
            </CardHeader>
            {isUserGrowthLoading || !userGrowthData ? (
              <LoadingChartContent />
            ) : (
              <CardContent>
                <ChartContainer
                  config={userGrowthConfig}
                  className="h-[300px] w-full">
                  <LineChart accessibilityLayer data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
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
            )}
          </Card>
        )}

        {shouldShowRevenue && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Month</CardTitle>
              <CardDescription>Monthly revenue in RM</CardDescription>
            </CardHeader>
            {isRevenueLoading || !revenueData ? (
              <LoadingChartContent />
            ) : (
              <CardContent>
                <ChartContainer
                  config={revenueConfig}
                  className="h-[300px] w-full">
                  <BarChart accessibilityLayer data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="revenue" />}
                    />
                    <Bar
                      dataKey="totalRevenue"
                      fill="var(--color-revenue)"
                      name={"Revenue"}
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            )}
          </Card>
        )}

        {shouldShowTasks && (
          <Card>
            <CardHeader>
              <CardTitle>Task Categories Distribution</CardTitle>
              <CardDescription>Breakdown of task types</CardDescription>
            </CardHeader>
            {isTaskCategoriesLoading || !taskCategoriesData ? (
              <LoadingChartContent />
            ) : (
              <CardContent>
                <ChartContainer
                  config={dynamicTaskCategoriesConfig}
                  className="h-[300px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={aggregatedTaskData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name">
                      {aggregatedTaskData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`var(--chart-${(index % 5) + 1})`}
                        />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            )}
          </Card>
        )}

        {shouldShowAIFlags && (
          <Card>
            <CardHeader>
              <CardTitle>AI Flags Trend</CardTitle>
              <CardDescription>Daily AI moderation flags</CardDescription>
            </CardHeader>
             {isAiFlagsDataLoading ? (
              <LoadingChartContent />
            ) : (
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
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
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
            )}
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

function Calendar22({
  setFrom,
  setTo,
}: {
  setFrom: (val: string) => void;
  setTo: (val: string) => void;
}) {
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
  }, [isRangeComplete, dateRange, setFrom, setTo]);

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    const complete = range && range.from && range.to;
    setIsRangeComplete(!!complete);

    if (complete) {
      setFrom(toYMD(range.from!));
      setTo(toYMD(range.to!));
      setOpen(false);
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
            max={90}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
