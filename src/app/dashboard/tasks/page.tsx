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
  getAllTasksByRolePaginated,
} from "@/features/tasks/server/action";
import Link from "next/link";

export default async function BrowseTasks({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.role || !currentUser.id) return;

  const categoryMap = await getAllCategoryMap();
  const { q, page } = await searchParams;
  const search = q ?? "";
  const pages = Number.parseInt(page ?? "1");
  const limit = 3;
  const offset = (pages - 1) * limit;
  console.log("user Role:", currentUser.role);
  const { tasks, totalCount } = await getAllTasksByRolePaginated(
    currentUser.id,
    currentUser.role,
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
          <h1 className="text-4xl font-bold text-foreground">
            {currentUser.role == "POSTER"
              ? "Public Tasks"
              : "Available Tasks & Jobs"}
          </h1>
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
              placeholder={
                currentUser.role == "POSTER"
                  ? "Search Public tasks..."
                  : "Search Available tasks..."
              }
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
                className="hover:shadow-md transition-shadow bg-card w-full"
                key={task.id}>
                <CardHeader className="pb-2 sm:pb-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                          {task.title}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2 mb-2 text-xs sm:text-sm">
                        <p className="text-foreground">
                          Posted by {task.poster.name}
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-gray-500">
                          {task.createdAt?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Mobile: Stack vertically, Desktop: Horizontal */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 sm:flex-shrink-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="text-xs">
                          <p>RM{task.price}</p>
                        </Badge>
                        {getStatusBadge(task.status!)}
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full sm:w-auto text-xs sm:text-sm"
                        asChild>
                        <Link href={`/dashboard/tasks/${task.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-foreground mb-3">
                    <Badge
                      className={`${getColorClass(
                        categoryMap[task.categoryId]
                      )} text-xs`}>
                      {categoryMap[task.categoryId] || "Unknown"}
                    </Badge>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      {task.deadline && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">
                            Due:{" "}
                            {formatDate(task.deadline.toLocaleDateString())}
                          </span>
                        </div>
                      )}

                      {task.solverId && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">
                            Being solved
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-foreground text-sm sm:text-base leading-relaxed">
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
