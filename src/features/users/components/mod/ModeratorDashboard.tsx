"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Users,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  CheckSquare,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export default function ModeratorDashboard() {
  const statsData = [
    { name: "Mon", reportedTasks: 2, resolvedReports: 1, tasks: 20 ,disputes: 1},
    { name: "Tue", reportedTasks: 3, resolvedReports: 2, tasks: 10 ,disputes: 3},
    { name: "Wed", reportedTasks: 1, resolvedReports: 2, tasks: 50 ,disputes: 0},
    { name: "Thu", reportedTasks: 4, resolvedReports: 3, tasks: 60 ,disputes: 5},
    { name: "Fri", reportedTasks: 2, resolvedReports: 4, tasks: 10 ,disputes: 4},
  ];

  const tasksConfig = {
    tasks: { label: "Tasks", color: "#10b981" },
  } satisfies ChartConfig;

  const reportedConfig = {
    reportedTasks: { label: "Reported Tasks", color: "#ef4444" },
  } satisfies ChartConfig;

  const resolvedConfig = {
    resolvedReports: { label: "Resolved Reports", color: "#10b981" },
  } satisfies ChartConfig;

  const activityConfig = {
    reportedTasks: { label: "Reported Tasks", color: "#ef4444" },
    resolvedReports: { label: "Resolved Reports", color: "#10b981" },
  } satisfies ChartConfig;

  const upcomingActions = [
    { id: 1, title: "Review Task Report #104", due: "Today" },
    { id: 2, title: "Approve User Registration", due: "2 days" },
    { id: 3, title: "Audit Earnings Discrepancy", due: "3 days" },
  ];

  const quickActions = [
    "Review Reports",
    "Manage Users",
    "Audit Payments",
    "View Logs",
  ];

  return (
    <div className="w-full h-full px-5">
      {/* Header */}
      <header className="flex justify-between items-center mb-9 pt-4">
        <div>
          <h1 className="text-4xl font-bold">Moderator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor reported tasks, user actions, and moderation stats.
          </p>
        </div>
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 rounded-full">
          Moderator++
        </Badge>
      </header>

      <section className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Tasks</h2>
            <CheckSquare className="text-green-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {statsData.reduce((sum, d) => sum + d.tasks, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Tasks created this week
          </p>
          <div className="w-full h-40">
            <ChartContainer config={tasksConfig} className="w-full h-full">
              <BarChart accessibilityLayer data={statsData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="tasks" fill="var(--color-tasks)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Reported Tasks</h2>
            <Shield className="text-red-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {statsData.reduce((sum, d) => sum + d.reportedTasks, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Total reported tasks this week
          </p>
          <div className="w-full h-40">
            <ChartContainer config={reportedConfig} className="w-full h-full">
              <BarChart accessibilityLayer data={statsData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="reportedTasks"
                  fill="var(--color-reportedTasks)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Resolved Reports</h2>
            <CheckCircle className="text-green-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {statsData.reduce((sum, d) => sum + d.resolvedReports, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Reports resolved this week
          </p>
          <div className="w-full h-40">
            <ChartContainer config={resolvedConfig} className="w-full h-full">
              <LineChart accessibilityLayer data={statsData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="resolvedReports"
                  stroke="var(--color-resolvedReports)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Moderation Activity</h2>
            <TrendingUp className="text-purple-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {statsData.reduce(
              (sum, d) => sum + d.reportedTasks + d.resolvedReports,
              0
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Total actions this week
          </p>
          <div className="w-full h-40">
            <ChartContainer config={activityConfig} className="w-full h-full">
              <LineChart accessibilityLayer data={statsData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="reportedTasks"
                  stroke="var(--color-reportedTasks)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="resolvedReports"
                  stroke="var(--color-resolvedReports)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="w-6 h-6" /> Pending Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingActions.map((action) => (
            <div
              key={action.id}
              className="p-4 bg-background/20 rounded-xl shadow-md flex justify-between items-center">
              <div>
                <p className="font-medium">{action.title}</p>
                <p className="text-sm text-muted-foreground">
                  Due {action.due}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {quickActions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="flex-1 md:flex-none flex justify-between items-center px-6 py-3 rounded-xl">
              {action} <ArrowRight className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
