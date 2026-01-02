"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  moderatorReportedTaskStatsQuery,
  moderatorResolvedTaskStatsQuery,
  moderatorTaskStatsQuery,
} from "@/features/tasks/client/queries";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  CheckSquare,
  Loader2,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

const tasksConfig = {
  tasks: {
    label: "Tasks",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const reportedTasksConfig = {
  reportedTasks: {
    label: "Reported Tasks",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const resolvedTasksConfig = {
  resolvedReports: {
    label: "Resolved Reports",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function ModeratorDashboard() {
  const path = usePathname();

  const {
    data: moderatorTaskStats,
    isLoading: isModeratorTaskStatsLoading,
    error: moderatorTaskStatsError,
  } = useQuery(moderatorTaskStatsQuery());

  const {
    data: moderatorReportedTaskStats,
    isLoading: isModeratorReportedTaskStatsLoading,
    error: moderatorReportedTaskStatsError,
  } = useQuery(moderatorReportedTaskStatsQuery());

  const {
    data: moderatorResolvedTaskStats,
    isLoading: isModeratorResolvedTaskStatsLoading,
    error: moderatorResolvedTaskStatsError,
  } = useQuery(moderatorResolvedTaskStatsQuery());

  const quickActions = [
    { name: "Category Managment", href: `${path}/categories` },
    { name: "Deadline Managment", href: `${path}/deadline` },
    { name: "User Reports", href: `${path}/user-reports` },
    { name: "View Disputes", href: `${path}/disputes` },
  ];

  const renderChart = (
    isLoading: boolean,
    data: any[] | undefined,
    chart: React.ReactNode,
  ) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className="flex justify-center items-center h-40 text-muted-foreground text-sm">
          No data available for this period
        </div>
      );
    }
    return chart;
  };
  console.log(moderatorResolvedTaskStats);

  return (
    <div className="w-full h-full px-5 ">
      <header className="flex justify-between items-center mb-9 pt-4">
        <div>
          <h1 className="text-4xl font-bold">Moderator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor reported tasks, user actions, and moderation stats.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-4">
              {quickActions.map((action, idx) => (
                <Button
                  asChild
                  key={idx}
                  variant="outline"
                  className="flex-1 md:flex-none flex justify-between items-center px-6 py-3 rounded-xl"
                >
                  <Link href={action.href}>
                    {action.name}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ))}
              <Badge variant={"success"} className="rounded-full">
                Moderator++
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <section className="grid lg:grid-cols-3 gap-4 mb-12">
        {/* Tasks Card */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="font-semibold text-lg">Tasks</CardTitle>
            <CardDescription>
              <CheckSquare className="text-green-500 w-6 h-6" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {isModeratorTaskStatsLoading
                ? "..."
                : (moderatorTaskStats?.reduce((sum, d) => sum + d.count, 0) ??
                  0)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tasks created this week
            </p>
            {renderChart(
              isModeratorTaskStatsLoading,
              moderatorTaskStats,
              <ChartContainer config={tasksConfig} className="w-full h-40">
                <BarChart accessibilityLayer data={moderatorTaskStats}>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <CartesianGrid vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ChartContainer>,
            )}
          </CardContent>
        </Card>

        {/* Reported Tasks Card */}
        <Card>
          <CardHeader className="flex justify-between items-center ">
            <CardTitle className="font-semibold text-lg">
              Reported Tasks
            </CardTitle>
            <CardDescription>
              <Shield className="text-red-500 w-6 h-6" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {isModeratorReportedTaskStatsLoading
                ? "..."
                : (moderatorReportedTaskStats?.reduce(
                    (sum, d) => sum + d.count,
                    0,
                  ) ?? 0)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Total reported tasks this week
            </p>
            {renderChart(
              isModeratorReportedTaskStatsLoading,
              moderatorReportedTaskStats,
              <ChartContainer
                config={reportedTasksConfig}
                className="w-full h-40"
              >
                <BarChart accessibilityLayer data={moderatorReportedTaskStats}>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <CartesianGrid vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="count" fill="var(--chart-3)" radius={4} />
                </BarChart>
              </ChartContainer>,
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="font-semibold text-lg">
              Resolved Reports
            </CardTitle>
            <CardDescription>
              <CheckCircle className="text-blue-500 w-6 h-6" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {isModeratorResolvedTaskStatsLoading
                ? "..."
                : (moderatorResolvedTaskStats?.reduce(
                    (sum, d) => sum + d.count,
                    0,
                  ) ?? 0)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Reports resolved this week
            </p>
            {renderChart(
              isModeratorResolvedTaskStatsLoading,
              moderatorResolvedTaskStats,
              <ChartContainer
                config={resolvedTasksConfig}
                className="w-full h-40"
              >
                <LineChart
                  accessibilityLayer
                  data={moderatorResolvedTaskStats}
                  margin={{ left: 0, right: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(5)}
                  />
                  <CartesianGrid vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="count"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>,
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="w-6 h-6" /> Pending Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-background/20 rounded-xl shadow-md flex justify-between items-center">
            <p className="font-medium">Review Task Report #104</p>
            <span className="text-sm text-muted-foreground">Due Today</span>
          </div>
          <div className="p-4 bg-background/20 rounded-xl shadow-md flex justify-between items-center">
            <p className="font-medium">Approve User Registration</p>
            <span className="text-sm text-muted-foreground">Due in 2 days</span>
          </div>
          <div className="p-4 bg-background/20 rounded-xl shadow-md flex justify-between items-center">
            <p className="font-medium">Audit Earnings Discrepancy</p>
            <span className="text-sm text-muted-foreground">Due in 3 days</span>
          </div>
        </div>
      </section>
    </div>
  );
}
