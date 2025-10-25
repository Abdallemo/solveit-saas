"use client";

import SolverDashboardLoading from "@/app/dashboard/solver/loading";
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
  solverDashboardQuery,
  upcomingTasksQuery,
} from "@/features/tasks/client/queries";
import useRealtimeDeadlines from "@/hooks/useRealtimeDeadlines";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  DollarSign,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";


export default function SolverDashboardLanding() { 
  const path = usePathname();
  const {
    data: stats,
    isLoading: statsIsLoading,
    error: statsError,
  } = useQuery(solverDashboardQuery());
  const {
    data: deadlines,
    isLoading: deadlinesLoading,
    error: deadlinesError,
  } = useQuery(upcomingTasksQuery());

  const deadlineState = useRealtimeDeadlines(deadlines ?? []);
  if (statsError || deadlinesError) {
    throw new Error("something went wrong");
  }
  if (statsIsLoading || !stats || deadlinesLoading || !deadlines) {
    return <SolverDashboardLoading />;
  }

  const tasksConfig = {
    allTasks: { label: "All Tasks", color: "#3b82f6" },
    solvedTasks: { label: "Solved", color: "#10b981" },
    inProgressTasks: { label: "In Progress", color: "#f59e0b" },
  } satisfies ChartConfig;

  const earningsConfig = {
    earnings: { label: "Earnings", color: "#10b981" },
  } satisfies ChartConfig;

  const mentorshipConfig = {
    mentorSessions: { label: "Mentorship", color: "#8b5cf6" },
  } satisfies ChartConfig;

  const quickActions = [
    { name: "Browse Tasks", href: `${path}/tasks` },
    { name: "Assigned Tasks", href: `${path}/assigned` },
    { name: "Mentorship Sessions", href: `${path}/mentorship` },
    { name: "Earnings History", href: `${path}/earnings` },
  ];

  const tickFormatter = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="w-full h-full px-5">
      <header className="flex justify-between items-center mb-9 pt-4">
        <div>
          <h1 className="text-4xl font-bold">Solver Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your tasks, earnings, and mentorship activity at a glance.
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
                  className="flex-1 md:flex-none flex justify-between items-center px-6 py-3 rounded-xl">
                  <Link href={action.href}>
                    {action.name} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ))}
              <Badge variant={"success"} className="rounded-full">
                Solver++
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Active Tasks</h2>
                <CheckCircle className="w-6 h-6" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {stats.reduce((sum, d) => sum + d.allTasks, 0)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Solved: {stats.reduce((s, d) => s + d.solvedTasks, 0)} • In
              Progress: {stats.reduce((s, d) => s + d.inProgressTasks, 0)}
            </p>
            <div className="w-full h-40">
              <ChartContainer config={tasksConfig} className="w-full h-full">
                <BarChart accessibilityLayer data={stats}>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={tickFormatter}
                  />
                  <CartesianGrid vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="allTasks" fill="var(--chart-2)" radius={4} />
                  <Bar dataKey="solvedTasks" fill="var(--chart-1)" radius={4} />
                  <Bar
                    dataKey="inProgressTasks"
                    fill="var(--chart-4)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {" "}
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Monthly Earnings</h2>
                <DollarSign className="w-6 h-6" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              RM{stats.reduce((sum, d) => sum + d.earnings, 0)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Target: RM200 • Last Month: RM104
            </p>
            <div className="w-full h-40">
              <ChartContainer config={earningsConfig} className="w-full h-full">
                <LineChart accessibilityLayer data={stats}>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={tickFormatter}
                  />
                  <CartesianGrid vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="var(--chart-5)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {" "}
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Mentorship</h2>
                <Users className=" w-6 h-6" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {stats.reduce((sum, d) => sum + d.mentorSessions, 0)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Sessions this period
            </p>
            <div className="w-full h-40">
              <ChartContainer
                config={mentorshipConfig}
                className="w-full h-full">
                <LineChart accessibilityLayer data={stats}>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={tickFormatter}
                  />
                  <CartesianGrid vertical={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="mentorSessions"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="w-6 h-6" /> Upcoming Deadlines
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {deadlineState.map((task) => (
            <Card key={task.id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>
                  <p className="font-medium">{task.title}</p>
                </CardTitle>
                <CardDescription> Due {task.due}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
