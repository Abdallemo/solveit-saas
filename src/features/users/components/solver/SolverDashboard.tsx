import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, DollarSign, Users, ArrowRight, CheckCircle, TrendingUp } from "lucide-react"

export default function SolverDashboard() {
  const solverStats = [
    {
      title: "Active Tasks",
      value: 2,
      subtext: "In Progress: 2 • Pending Review: 0",
      icon: CheckCircle,
      trend: "+15%",
    },
    {
      title: "Monthly Earnings",
      value: "RM120",
      subtext: "Target: RM200 • Last Month: RM104",
      icon: DollarSign,
      trend: "+15%",
    },
    {
      title: "Due Soon",
      value: 2,
      subtext: "This Week: 2 • Next Week: 1",
      icon: Clock,
      trend: "0%",
    },
    {
      title: "Mentorship",
      value: 3,
      subtext: "Available: 3 • Completed: 2 this month",
      icon: Users,
      trend: "+50%",
    },
  ]

  const upcomingTasks = [
    {
      id: 1,
      title: "Website Redesign Review",
      dueDate: "Due in 2 days",
      priority: "High Priority",
      priorityVariant: "secondary" as const,
    },
    {
      id: 2,
      title: "API Integration Testing",
      dueDate: "Due in 4 days",
      priority: "Medium",
      priorityVariant: "outline" as const,
    },
  ]

  const quickActions = [
    { label: "Browse Tasks", href: "/tasks/browse" },
    { label: "Assigned Tasks", href: "/tasks/assigned" },
    { label: "Mentorship Sessions", href: "/mentorship" },
    { label: "Earnings History", href: "/earnings" },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Solver Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your activity summary and quick actions.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Solver++
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {solverStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <p className="text-sm text-muted-foreground mb-3">{stat.subtext}</p>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span
                    className={`text-sm font-medium ${
                      stat.trend.startsWith("+")
                        ? "text-green-600"
                        : stat.trend === "0%"
                          ? "text-gray-600"
                          : "text-red-600"
                    }`}
                  >
                    {stat.trend} from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Tasks that need your attention soon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.dueDate}</p>
                  </div>
                  <Badge variant={task.priorityVariant}>{task.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to key areas of your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <Button key={index} className="w-full justify-between bg-transparent h-12" variant="outline">
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
