import {
  Calendar,
  Search,
  SquareArrowUpRight,
  User, // Re-added User icon for consistency with BrowseTasks
} from "lucide-react";
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
  getAssignedTasksbyIdPaginated,
} from "@/features/tasks/server/action";
import Link from "next/link";

export default async function SolverAssignedTasks({
  searchParams,
}: {
  searchParams: Promise<{ q: string; page: string }>;
}) {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.role || !currentUser.id) return;

  const categoryMap = await getAllCategoryMap();

  const { q, page } = await searchParams;
  const search = q ?? "";
  const pages = Number.parseInt(page ?? "1");
  const limit = 3;
  const offset = (pages - 1) * limit;

  const { tasks, totalCount } = await getAssignedTasksbyIdPaginated(
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
      {/* Max-width for content, centered, with responsive padding - Matches BrowseTasks */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header section: flex-col on mobile, flex-row on small screens and up - Matches BrowseTasks */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">
            Your Assigned Tasks
          </h1>
          <Badge variant="outline" className="text-foreground">
            Total: {totalCount}
          </Badge>
        </div>

        {/* Search bar section - Matches BrowseTasks layout */}
        <div className="mb-8 items-center">
          <form
            method="get"
            className="flex items-center gap-3 justify-center"
          >
            <Input
              name="q"
              placeholder="Search your assigned tasks..."
              defaultValue={search}
              className="flex-1" // Matches BrowseTasks Input width
            />
            <Button
              type="submit"
              className="whitespace-nowrap" // Matches BrowseTasks Button width
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Task Cards Container - Matches BrowseTasks spacing and min-height */}
        <div className="space-y-6 min-h-[500px]">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Card
                key={task.id}
                // Card styling - Matches BrowseTasks
                className="hover:shadow-md transition-shadow bg-card w-full"
              >
                {/* CardHeader with consistent padding - Matches BrowseTasks */}
                <CardHeader className="pb-2 sm:pb-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex flex-col min-w-0 flex-1">
                      {/* Task Title with responsive font size and truncation - Matches BrowseTasks */}
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                          {task.title}
                        </h3>
                      </div>
                      {/* Posted by and Date with responsive layout and improved text color - Matches BrowseTasks */}
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

                    {/* Action Buttons (Status, View Task, Continue Workspace) */}
                    {/* Flex layout and gaps - Matches BrowseTasks general layout */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 sm:flex-shrink-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* No price badge in PosterPublishedTasks, keep consistent by omitting */}
                        {getStatusBadge(task.status!)}
                      </div>
                      <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm">
                        <Link href={`/dashboard/tasks/${task.id}`}>
                          <SquareArrowUpRight />
                        </Link>
                      </Button>
                      {/* "Continue Workspace" Button - Specific to PosterPublishedTasks */}
                      <Button
                        variant="success" // Specific variant
                        size="sm"
                        // Sizing adjusted to match the other button in this component
                        className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap"
                        asChild
                      >
                        <Link
                          href={`/dashboard/solver/workspace/start/${task.id}`}
                        >
                          {task.workspace
                            ? "Continue Workspace"
                            : "Begin Workspace"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* CardContent with consistent padding - Matches BrowseTasks */}
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-foreground mb-3">
                    <Badge
                      className={`${getColorClass(
                        categoryMap[task.categoryId]
                      )} text-xs`} // Matches BrowseTasks badge text size
                    >
                      {categoryMap[task.categoryId] || "Unknown"}
                    </Badge>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      {task.deadline && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> {/* Icon size matches BrowseTasks */}
                          <span className="text-xs sm:text-sm"> {/* Text size matches BrowseTasks */}
                            Due: {formatDate(task.deadline.toLocaleDateString())}
                          </span>
                        </div>
                      )}

                      {/* Re-added Being solved status with User icon for consistency */}
                      {task.solverId && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> {/* Icon size matches BrowseTasks */}
                          <span className="text-xs sm:text-sm"> {/* Text size matches BrowseTasks */}
                            Being solved
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task Description with responsive font size and line clamping for consistent height */}
                  <p className="text-foreground text-sm sm:text-base leading-relaxed line-clamp-2">
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

        {/* Pagination - Matches BrowseTasks positioning and margins */}
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
                    {/* The ellipsis logic here is slightly different from the initial PosterPublishedTasks,
                        but aligns with the more general pagination pattern. */}
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