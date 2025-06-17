import { Calendar, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getServerUserSession } from "@/features/auth/server/actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate, getColorClass } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TaskStatusType } from "@/drizzle/schemas";
import {
  getAllCategoryMap,
  getPosterTasksbyIdPaginated,
} from "@/features/tasks/server/action";
import Link from "next/link";




export default async function PosterPublishedTasks({
  searchParams,
}: {searchParams:Promise<{q:string,page:string}>}) {

  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.role || !currentUser.id) return;

  const categoryMap = await getAllCategoryMap();

  const {q,page} = await searchParams
  const search = q ?? "";
  const pages = Number.parseInt(page ?? "1");
  const limit = 3;
  const offset = (pages - 1) * limit;

  const { tasks, totalCount } = await getPosterTasksbyIdPaginated(
    currentUser.id,
    {
      search,
      limit,
      offset,
    }
  );

  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevious = pages > 1;
  const hasNext = pages < totalPages;

  const getStatusBadge = (status: TaskStatusType) => {
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
      case "ASSIGNED":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Assigned
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">Your Tasks</h1>
          <Badge variant="outline" className="text-foreground">
            Total: {totalCount}
          </Badge>
        </div>

        <div className="mb-8  items-center">
          <form
            method="get"
            className="flex items-center gap-3  justify-center">
            <Input
              name="q"
              placeholder="Search your tasks..."
              defaultValue={search}
              className="flex-1"
            />
            <Button type="submit" className="whitespace-nowrap">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        <div className="space-y-6 min-h-[500px]">
          {tasks.length > 0 ? (
            tasks.map((task) => (
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
                          Posted by {task.poster.name}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-gray-500 text-sm">
                          {task.createdAt?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(task.status!)}
                      <Button variant="success" asChild>
                        <Link href={`/dashboard/tasks/${task.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center space-x-6 text-sm text-foreground mb-3">
                    <Badge
                      className={getColorClass(categoryMap[task.categoryId])}>
                      {categoryMap[task.categoryId] || "Unknown"}
                    </Badge>

                    {task.deadline && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Due: {formatDate(task.deadline.toLocaleDateString())}
                        </span>
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
            ))
          ) : (
            <div className="flex items-center justify-center text-muted-foreground py-24 border rounded-md bg-card/50">
              No tasks found for this page or search query.
            </div>
          )}
        </div>

        {(hasPrevious || hasNext) && (
          <div className="flex justify-center mt-8 mb-8">
            <Pagination>
              <PaginationContent>
                {hasPrevious && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`?q=${search}&page=${pages - 1}`}
                    />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationLink href={`?q=${search}&page=${pages}`} isActive>
                    {pages}
                  </PaginationLink>
                </PaginationItem>

                {hasNext && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href={`?q=${search}&page=${pages + 1}`} />
                    </PaginationItem>
                  </>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
