"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Wallet, BookOpen, ArrowRight } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

import { PosterActivityOverview, statsDataType } from "./PosterActivityOverview";
import { usePathname } from "next/navigation";
import Link from "next/link";
// const chartData = [
//   { date: "2024-08-01", postedTasks: 30, expenses: 120, mentorSessions: 1 },
//   { date: "2024-08-02", postedTasks: 24, expenses: 80, mentorSessions: 0 },
//   { date: "2024-08-03", postedTasks: 45, expenses: 200, mentorSessions: 2 },
//   { date: "2024-08-04", postedTasks: 16, expenses: 60, mentorSessions: 1 },
//   { date: "2024-08-05", postedTasks: 56, expenses: 150, mentorSessions: 3 },
//   { date: "2024-08-06", postedTasks: 26, expenses: 100, mentorSessions: 1 },
//   { date: "2024-08-07", postedTasks: 35, expenses: 90, mentorSessions: 2 },
// ];

export default function PosterDashboard({chartData}:{chartData:statsDataType[]}) {
  const path = usePathname();

  const posterChartConfigs = {
    postedTasks: { label: "Posted Tasks", color: "#3b82f6" },
    expenses: { label: "Expenses (RM)", color: "#ef4444" },
    mentorSessions: { label: "Mentor Sessions", color: "#10b981" },
  } satisfies ChartConfig;

  const quickActions = [
    { name: "Create New Task", href: `${path}/newTask` },
    { name: "View Posted Tasks", href: `${path}/tasks` },
    { name: "Book Mentor", href: `${path}/bookings` },
    { name: "Expense History", href: `${path}/expenses` },
  ];

  return (
    <div className="w-full h-full px-5 ">
      <header className="flex justify-between items-center mb-9 pt-4">
        <div>
          <h1 className="text-4xl font-bold">Poster Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your tasks, expenses, and mentorship bookings.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col ">
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
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200  rounded-full">
            Poster++
          </Badge>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Posted Tasks</h2>
            <CheckCircle className="text-blue-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {chartData.reduce((sum, d) => sum + d.postedTasks, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Total tasks posted this week
          </p>
          <div className="w-full h-40">
            <ChartContainer
              config={{ postedTasks: posterChartConfigs.postedTasks }}
              className="w-full h-full">
              <BarChart accessibilityLayer data={chartData}>
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
                  dataKey="postedTasks"
                  fill="var(--color-postedTasks)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Expenses</h2>
            <Wallet className="text-red-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            RM{chartData.reduce((sum, d) => sum + d.expenses, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Total spent this week
          </p>
          <div className="w-full h-40">
            <ChartContainer
              config={{ expenses: posterChartConfigs.expenses }}
              className="w-full h-full">
              <LineChart accessibilityLayer data={chartData}>
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
                  dataKey="expenses"
                  stroke="var(--color-expenses)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Mentor Sessions</h2>
            <BookOpen className="text-green-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {chartData.reduce((sum, d) => sum + d.mentorSessions, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sessions booked this week
          </p>
          <div className="w-full h-40">
            <ChartContainer
              config={{ mentorSessions: posterChartConfigs.mentorSessions }}
              className="w-full h-full">
              <BarChart accessibilityLayer data={chartData}>
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
                  dataKey="mentorSessions"
                  fill="var(--color-mentorSessions)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <PosterActivityOverview
          chartConfig={posterChartConfigs}
          chartData={chartData}
        />
      </section>
    </div>
  );
}
