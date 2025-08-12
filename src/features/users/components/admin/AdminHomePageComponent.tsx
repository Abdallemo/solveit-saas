"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Users,
  CheckSquare,
  AlertTriangle,
  DollarSign,
  Server,
  Shield,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { LogsTyep } from "@/lib/logging/action"
import { StastType } from "@/app/dashboard/admin/page"


const aiModerationData = [
  { name: "Mon", flagged: 45 },
  { name: "Tue", flagged: 52 },
  { name: "Wed", flagged: 38 },
  { name: "Thu", flagged: 61 },
  { name: "Fri", flagged: 43 },
  { name: "Sat", flagged: 29 },
  { name: "Sun", flagged: 35 },
]

const falsePositiveData = [
  { name: "Correct", value: 87, color: "#22c55e" },
  { name: "False Positive", value: 13, color: "#ef4444" },
]

const chartConfig = {
  flagged: {
    label: "Tasks Flagged",
    color: "var(--chart-1)",
  },
}

function getLogLevelColor(level: string) {
  switch (level) {
    case "error":
      return "bg-red-100 text-red-800 border-red-200"
    case "warn":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "info":
      return "bg-blue-100 text-blue-800 border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getLogIcon(level: string) {
  switch (level) {
    case "error":
      return <AlertCircle className="h-4 w-4" />
    case "warn":
      return <AlertTriangle className="h-4 w-4" />
    case "info":
      return <Info className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}
export default function AdminDashboardComponent({serverLogs,stats}:{serverLogs:LogsTyep,stats:StastType}) {
  const summaryStats = [
  {
    title: "Total Users",
    value: stats.users.total,
    subtext: `Posters: ${stats.users.posters} • Solvers: ${stats.users.solvers} • Moderators: ${stats.users.moderators}`,
    icon: Users,
    trend: `${stats.users.trend}%`,
  },
  {
    title: "Total Tasks",
    value: `${stats.tasks.total}`,
    subtext: `Active: ${stats.tasks.active} • Completed: ${stats.tasks.completed}`,
    icon: CheckSquare,
    trend: `${stats.tasks.trend}%`,
  },
  {
    title: "Total Disputes",
    value: `${stats.disputes.total}`,
    subtext: `Pending: ${stats.disputes.pending} • Resolved: ${stats.disputes.pending}`,
    icon: AlertTriangle,
    trend: `${stats.disputes.trend}%`,
  },
  {
    title: "Monthly Revenue",
    value: `RM${stats.revenue.total}`,
    subtext: `Target: RM${stats.revenue.monthly} `,
    icon: DollarSign,
    trend: `${stats.revenue.trend}%`,
  },
]
  return (
    <div className="min-h-screen bg-background md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
      
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              System Healthy
            </Badge>
          </div>
        </div>

    
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span
                    className={`text-xs font-medium ${stat.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.trend} from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <CardTitle>Latest Server Logs</CardTitle>
              </div>
              <CardDescription>Real-time system activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {serverLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                    <Badge className={`${getLogLevelColor(log.level)} flex items-center space-x-1 px-2 py-1`}>
                      {getLogIcon(log.level)}
                      <span className="text-xs font-medium uppercase">{log.level}</span>
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{log.timestamp.toLocaleDateString()}</p>
                      <p className="text-sm mt-1 break-words">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>AI Moderation Stats</CardTitle>
              </div>
              <CardDescription>Weekly AI moderation performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            
              <div>
                <h4 className="text-sm font-medium mb-3">Tasks Flagged This Week</h4>
                <ChartContainer config={chartConfig} className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiModerationData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="flagged" fill="var(--chart-1)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

           
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">False Positive Rate</p>
                  <div className="flex items-center space-x-2">
                    <div className="h-16 w-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={falsePositiveData}
                            cx="50%"
                            cy="50%"
                            innerRadius={12}
                            outerRadius={24}
                            dataKey="value"
                          >
                            {falsePositiveData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">13%</p>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Training Feedback</p>
                  <div>
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-xs text-muted-foreground">Responses received</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600 font-medium">+23% this week</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
