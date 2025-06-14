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


const summaryStats = [
  {
    title: "Total Users",
    value: "12,847",
    subtext: "Posters: 8,234 • Solvers: 3,891 • Moderators: 722",
    icon: Users,
    trend: "+12.5%",
  },
  {
    title: "Total Tasks",
    value: "45,231",
    subtext: "Active: 1,234 • Completed: 43,997",
    icon: CheckSquare,
    trend: "+8.2%",
  },
  {
    title: "Total Disputes",
    value: "892",
    subtext: "Pending: 23 • Resolved: 869",
    icon: AlertTriangle,
    trend: "-3.1%",
  },
  {
    title: "Monthly Revenue",
    value: "$127,450",
    subtext: "Target: $150,000 • 85% achieved",
    icon: DollarSign,
    trend: "+15.7%",
  },
]

const serverLogs = [
  {
    id: 1,
    timestamp: "2024-01-15 14:32:18",
    level: "info",
    message: "User authentication successful for user_id: 12847",
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:31:45",
    level: "warn",
    message: "High memory usage detected on server node-03 (87%)",
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:30:22",
    level: "error",
    message: "Database connection timeout in payment processing module",
  },
  { id: 4, timestamp: "2024-01-15 14:29:15", level: "info", message: "Scheduled backup completed successfully" },
  { id: 5, timestamp: "2024-01-15 14:28:33", level: "warn", message: "Rate limit exceeded for IP: 192.168.1.100" },
  { id: 6, timestamp: "2024-01-15 14:27:41", level: "info", message: "New task created: task_id: 45231" },
  {
    id: 7,
    timestamp: "2024-01-15 14:26:58",
    level: "error",
    message: "Failed to send notification email to user_id: 8234",
  },
]

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

export default function AdminDashboardComponent() {
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
                      <p className="text-sm text-muted-foreground">{log.timestamp}</p>
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
