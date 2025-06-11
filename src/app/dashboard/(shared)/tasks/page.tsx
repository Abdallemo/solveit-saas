import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tasksDumyData } from "@/features/tasks/lib/utils";
import { getServerUserSession } from "@/features/auth/server/actions";
import TasksComponent from "@/features/tasks/components/TasksComponent";

export default async function BrowseTasks() {
  const currentUser = await getServerUserSession();
  if ( !currentUser || !currentUser.role) return

  return (
    <div className="min-h-screen">
      
      <div className="flex ">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-left justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Browse Tasks
              </h1>
              <p className="text-foreground mt-1">
                Find tasks to help with and earn while learning
              </p>
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
            <Button variant="outline">All Categories</Button>
            {currentUser?.role == "SOLVER" && (
              <>
                <Button variant="outline">Status</Button>
                <Button variant="outline">Deadline</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        

        <TasksComponent  tasks={tasksDumyData} userRole={currentUser.role}/>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Tasks
          </Button>
        </div>
      </div>
    </div>
  );
}
