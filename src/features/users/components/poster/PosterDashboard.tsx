"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ArrowRight, BookOpen, CheckCircle, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PosterActivityOverview,
  statsDataType,
} from "./PosterActivityOverview";

export default function PosterDashboard({
  chartData,
}: {
  chartData: statsDataType[];
}) {
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
      <header className="flex justify-between items-center mb-3 pt-4">
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
          <Badge variant={"success"} className=" rounded-full">
            Poster++
          </Badge>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-8 mb-7">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Posted Tasks</h2>
                <CheckCircle className=" w-6 h-6" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Bar dataKey="postedTasks" fill="var(--chart-1)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Expenses</h2>
                <Wallet className=" w-6 h-6" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    stroke="var(--chart-2)"
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">Mentor Sessions</h2>
                <BookOpen className="w-6 h-6" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    fill="var(--chart-3)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
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
