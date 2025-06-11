import { Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { taskDataType } from "@/features/tasks/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRoleType } from "@/drizzle/schemas";
import { Separator } from "@/components/ui/separator";

export default function TasksComponent({
  tasks,
  userRole,
}: {
  tasks: taskDataType;
  userRole: UserRoleType;
}) {
    const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Open
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            In Progress
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };
  return (
    <main className="space-y-4">

      {/* this UI for Public Tasks*/}
      <div className="space-y-4">

        <div>
          <h1 className="text-2xl">Public Tasks</h1>
          <div className="flex items-center justify-between mb-6">
            <p className="text-foreground">
              {tasks.filter((task) => task.status === "OPEN").length} open tasks
              available
            </p>
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>Sort by: Most Recent</option>
              <option>Sort by: Deadline</option>
              <option>Sort by: Category</option>
            </select>
          </div>
        </div>

        {tasks.map((task) => (
          
          <Card
            key={task.id}
            className="hover:shadow-md transition-shadow bg-card">
            <CardHeader className="pb-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="text-foreground text-sm">
                      Posted by {task.posterName}
                    </p>
                    <span className="text-gray-400">•</span>
                    <p className="text-gray-500 text-sm">
                      {formatDate(task.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(task.status)}

                  {userRole == "SOLVER" && task.status === "OPEN" && (
                    <Button variant={"success"}>Help Solve</Button>
                  )}

                  {userRole == "POSTER" && task.status === "OPEN" && (
                    <Button variant={"success"}>View</Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center space-x-6 text-sm text-foreground mb-3">
                <Badge className={task.categoryColor}>
                  {task.categoryName}
                </Badge>

                {task.deadline && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDate(task.deadline)}</span>
                  </div>
                )}

                {task.solverId && (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Being solved</span>
                  </div>
                )}
              </div>

              <p className="text-foreground text-sm leading-relaxed">
                {task.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
