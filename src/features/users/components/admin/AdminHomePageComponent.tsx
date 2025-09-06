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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Users,
  CheckSquare,
  DollarSign,
  Shield,
  AlertTriangle,
  ArrowRight,
  AlertCircle,
  Info,
  Server,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  Area,
  AreaChart,
} from "recharts";
import Link from "next/link";
import { AdminActivityOverview } from "./AdminActivityOverview";
import { LogsTyep } from "@/lib/logging/action";
const statsData = [
  { date: "2024-08-01", users: 12, revenue: 1200, subscriptions: 1 },
  { date: "2024-08-02", users: 15, revenue: 1500, subscriptions: 5 },
  { date: "2024-08-03", users: 9, revenue: 1000, subscriptions: 2 },
  { date: "2024-08-04", users: 20, revenue: 2000, subscriptions: 0 },
  { date: "2024-08-06", users: 18, revenue: 1700, subscriptions: 8 },
];

const usersConfig = {
  users: { label: "New Users", color: "#3b82f6" },
  subscriptions: { label: "Subcriptions", color: "#10b981" },
  revenue: { label: "Revenue (RM)", color: "#f59e0b" },
} satisfies ChartConfig;
function getLogLevelColor(level: string) {
  switch (level) {
    case "error":
      return "bg-red-100 text-red-800 border-red-200";
    case "warn":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
function getLogIcon(level: string) {
  switch (level) {
    case "error":
      return <AlertCircle className="h-4 w-4" />;
    case "warn":
      return <AlertTriangle className="h-4 w-4" />;
    case "info":
      return <Info className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}
const quickActions = [
  { name: "Manage Users", href: "/dashboard/admin/users" },
  { name: "Moderate Tasks", href: "/dashboard/admin/moderation" },
  { name: "View Revenue Reports", href: "/dashboard/admin/revenue" },
  { name: "System Logs", href: "/dashboard/admin/logs" },
];

export default function AdminDashboard({
  serverLogs,
}: {
  serverLogs: LogsTyep;
}) {
  return (
    <div className="w-full h-full px-5">
      <header className="flex justify-between items-center mb-9 pt-4">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Platform-wide insights and system health.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-wrap gap-4">
            {quickActions.map((action, idx) => (
              <Button
                asChild
                key={idx}
                variant="outline"
                className="flex-1 md:flex-none flex justify-between items-center px-6 py-3 rounded-xl">
                <Link href={action.href}>
                  {action.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ))}
          </div>
          <Badge className="bg-green-50 text-green-700 border-green-200 rounded-full">
            System Healthy
          </Badge>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Users</h2>
            <Users className="text-blue-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {statsData.reduce((sum, d) => sum + d.users, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            New users this week
          </p>
          <div className="w-full h-40">
            <ChartContainer
              config={{ users: usersConfig.users }}
              className="w-full h-full">
              <BarChart accessibilityLayer data={statsData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="users" fill="var(--color-users)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Subscriptions</h2>
            <CheckSquare className="text-green-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {statsData.reduce((_, d) => d.subscriptions + d.subscriptions, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Subscriped users this week
          </p>
          <div className="w-full h-40">
            <ChartContainer
              config={{ subscriptions: usersConfig.subscriptions }}
              className="w-full h-full">
              <BarChart accessibilityLayer data={statsData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="subscriptions"
                  fill="var(--color-subscriptions)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Revenue</h2>
            <DollarSign className="text-yellow-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            RM{statsData.reduce((sum, d) => sum + d.revenue, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Revenue earned this week
          </p>
          <div className="w-full h-40">
            <ChartContainer
              config={{ revenue: usersConfig.revenue }}
              className="w-full h-full">
              <LineChart accessibilityLayer data={statsData}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </section>
      <Tabs defaultValue="activity" >
        <TabsList className="w-full">
          <TabsTrigger value="activity">Activity Overview</TabsTrigger>
          <TabsTrigger value="logs">Realtime Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="logs">
          <ServerLogs serverLogs={serverLogs} />
        </TabsContent>
        <TabsContent value="activity">
          <AdminActivityOverview
            chartData={statsData}
            statsDataConfig={usersConfig}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function ServerLogs({ serverLogs }: { serverLogs: LogsTyep }) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Server className="h-5 w-5" />
          <CardTitle>Latest Server Logs</CardTitle>
        </div>
        <CardDescription>Real-time system activity and events</CardDescription>
      </CardHeader>
      <CardContent className="h-60">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {serverLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center space-x-3 p-3 rounded-lg border bg-card ">
              <Badge
                className={`${getLogLevelColor(
                  log.level
                )} flex items-center space-x-1 px-2 py-1`}>
                {getLogIcon(log.level)}
                <span className="text-xs font-medium uppercase">
                  {log.level}
                </span>
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">
                  {log.timestamp.toLocaleDateString()}
                </p>
                <p className="text-sm mt-1 break-words">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
