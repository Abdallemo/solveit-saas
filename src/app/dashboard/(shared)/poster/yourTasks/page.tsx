import { Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ownTasksDumyData } from "@/features/tasks/lib/utils";
import { getServerUserSession } from "@/features/auth/server/actions";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function BrowseTasks() {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.role) return;

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
    <div className="min-h-screen">
      <div className="flex ">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-left justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Your Tasks</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks, skills, keywords..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {ownTasksDumyData.map((task) => (
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

                    <Button variant={"success"}>View Details</Button>
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

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Tasks
          </Button>
        </div>
      </div>
    </div>
  );
}
