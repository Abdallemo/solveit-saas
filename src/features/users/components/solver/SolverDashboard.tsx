"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle,
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

export default function SolverDashboardLanding() {
  const statsData = [
    { name: "Mon", tasks: 2, earnings: 50 },
    { name: "Tue", tasks: 3, earnings: 80 },
    { name: "Wed", tasks: 2, earnings: 100 },
    { name: "Thu", tasks: 4, earnings: 104 },
    { name: "Fri", tasks: 3, earnings: 120 },
  ];

  const mentorData = [
    { name: "Mon", mentorship: 1 },
    { name: "Tue", mentorship: 2 },
    { name: "Wed", mentorship: 2 },
    { name: "Thu", mentorship: 3 },
    { name: "Fri", mentorship: 3 },
  ];

  const upcomingTasks = [
    { id: 1, title: "Website Redesign Review", due: "2 days" },
    { id: 2, title: "API Integration Testing", due: "4 days" },
    { id: 3, title: "Mentorship Session Prep", due: "5 days" },
  ];

  const tasksConfig = {
    tasks: { label: "Tasks", color: "#3b82f6" },
  } satisfies ChartConfig;

  const earningsConfig = {
    earnings: { label: "Earnings", color: "#10b981" },
  } satisfies ChartConfig;

  const mentorshipConfig = {
    mentorship: { label: "Mentorship", color: "#8b5cf6" },
  } satisfies ChartConfig;

  return (
    <div className="w-full h-full p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold">Solver Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your tasks, earnings, and mentorship activity at a glance.
          </p>
        </div>
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 rounded-full">
          Solver++
        </Badge>
      </header>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Active Tasks</h2>
            <CheckCircle className="text-blue-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {statsData.reduce((sum, d) => sum + d.tasks, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            In Progress: 3 • Pending Review: 1
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
            <h2 className="font-semibold text-lg">Monthly Earnings</h2>
            <DollarSign className="text-green-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            RM{statsData.reduce((sum, d) => sum + d.earnings, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Target: RM200 • Last Month: RM104
          </p>
          <div className="w-full h-40">
            <ChartContainer config={earningsConfig} className="w-full h-full">
              <LineChart accessibilityLayer data={statsData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--color-earnings)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        <div className="p-6 bg-background/20 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Mentorship</h2>
            <Users className="text-purple-500 w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {mentorData.reduce((sum, d) => sum + d.mentorship, 0)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sessions this week
          </p>
          <div className="w-full h-40">
            <ChartContainer config={mentorshipConfig} className="w-full h-full">
              <LineChart accessibilityLayer data={mentorData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <CartesianGrid vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="mentorship"
                  stroke="var(--color-mentorship)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CalendarDays className="w-6 h-6" /> Upcoming Deadlines
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-background/20 rounded-xl shadow-md flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">
                  Due in {task.due}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {["Browse Tasks", "Assigned Tasks", "Mentorship Sessions", "Earnings History"].map(
            (action, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="flex-1 md:flex-none flex justify-between items-center px-6 py-3 rounded-xl"
              >
                {action} <ArrowRight className="w-4 h-4" />
              </Button>
            )
          )}
        </div>
      </section>
    </div>
  );
}
