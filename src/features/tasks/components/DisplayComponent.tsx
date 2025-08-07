"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Search,
  SquareArrowUpRight,
  User,
  Grid3X3,
  List,
  Table,
  Clock,
  Check,
  ChevronsUpDown,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useMemo, useState } from "react";
import GetStatusBadge from "./taskStatusBadge";
import {
  PosterTasksFiltred,
  SolverAssignedTaskType,
} from "../server/task-types";
import { TaskStatusType } from "@/drizzle/schemas";
import { useSearchParams, useRouter } from "next/navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import { cn, getColorClass } from "@/lib/utils";
type DisplayComponentProps = {
  itretable: SolverAssignedTaskType[] | PosterTasksFiltred[];
  totalCount: number;
  categoryMap: Record<string, string>;
  pages: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  filterType: "status" | "category";
  title: string;
};
const STATUS_OPTIONS: TaskStatusType[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "SUBMITTED",
];
function typeGuardIsSolver(
  tasks: SolverAssignedTaskType[] | PosterTasksFiltred[]
): tasks is SolverAssignedTaskType[] {
  return tasks.length > 0 && "blockedSolvers" in tasks[0];
}
export default function DisplayListComponent({
  categoryMap,
  hasNext,
  hasPrevious,
  pages,
  itretable: itretables,
  totalCount,
  title,
  filterType,
}: DisplayComponentProps) {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const searchKey =
    typeGuardIsSolver(itretables) == true || filterType == "status"
      ? "status"
      : "category";

  const selectedValue = useMemo(() => {
    return searchParams.get(searchKey) ?? "";
  }, [searchParams, searchKey]);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === selectedValue) {
      params.delete(searchKey);
    } else {
      params.set(searchKey, value);
    }
    router.replace(`?${params.toString()}`);
    setOpen(false);
  };
  const filteredItretable = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return itretables.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(lowerSearch) ||
        task.description?.toLowerCase().includes(lowerSearch);
      const matchValue = (() => {
        if (filterType === "category") {
          return (
            !selectedValue || categoryMap[task.categoryId] === selectedValue
          );
        } else {
          return !selectedValue || task.status === selectedValue;
        }
      })();
      return matchSearch && matchValue;
    });
  }, [search, itretables, categoryMap, filterType, selectedValue]);

  function ViewToggle() {
    return (
      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
        <Button
          variant={viewMode === "cards" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("cards")}
          className="h-8 px-3">
          <Grid3X3 className="w-4 h-4 mr-1" />
          Cards
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="h-8 px-3">
          <List className="w-4 h-4 mr-1" />
          List
        </Button>
        <Button
          variant={viewMode === "table" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("table")}
          className="h-8 px-3">
          <Table className="w-4 h-4 mr-1" />
          Table
        </Button>
      </div>
    );
  }
  function statusUiCheck(task: SolverAssignedTaskType | PosterTasksFiltred) {
    return (
      <>
        {"blockedSolvers" in task &&
        task.blockedSolvers.some(
          (blocked) => blocked.userId === currentUser?.id!
        ) ? (
          <Badge
            variant={"secondary"}
            className="bg-yellow-100 text-yellow-800">
            canceled
          </Badge>
        ) : (
          GetStatusBadge(task.status!)
        )}
      </>
    );
  }
  function actionButtoneCheck(
    task: SolverAssignedTaskType | PosterTasksFiltred
  ) {
    return (
      <>
        {"blockedSolvers" in task ? (
          <Button variant="outline" asChild className="w-1/3">
            <Link href={`/dashboard/tasks/${task.id}`}>
              <SquareArrowUpRight />
            </Link>
          </Button>
        ) : (
          (task.status === "SUBMITTED" || task.status === "COMPLETED") && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard/tasks/${task.id}/solutions/${task.taskSolution.id}`}>
                <SquareArrowUpRight className="w-4 h-4 mr-1" />
                View Solution
              </Link>
            </Button>
          )
        )}
        {"blockedSolvers" in task ? (
          <Button variant="default" size="sm" className="w-2/3 h-9" asChild>
            <Link href={`/dashboard/solver/workspace/start/${task.id}`}>
              {task.status === "IN_PROGRESS"
                ? "Continue Workspace"
                : task.blockedSolvers.some(
                    (blocked) => blocked.userId === currentUser?.id
                  ) ||
                  task.status === "COMPLETED" ||
                  task.status === "SUBMITTED"
                ? "View Workspace"
                : "Begin Workspace"}
            </Link>
          </Button>
        ) : (
          <Button size="sm" asChild>
            <Link href={`/dashboard/tasks/${task.id}`}>View Details</Link>
          </Button>
        )}
      </>
    );
  }
  function CardsView() {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
        {filteredItretable.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow ">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge className={getColorClass(categoryMap[task.categoryId])}>
                  {categoryMap[task.categoryId] || "Unknown"}
                </Badge>
                {statusUiCheck(task)}
              </div>
              <CardTitle className="text-lg leading-tight">
                {task.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {task.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {task.poster.name}
                </div>
                {task.deadline && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Due: {task.deadline}
                  </div>
                )}
                <p className={getColorClass(String(task.price), false, true)}>
                  RM{task.price?.toFixed(2)}
                </p>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                Posted: {task.createdAt?.toLocaleDateString()}
              </div>
              {task.solverId && task.solver && (
                <div className="text-sm text-green-600">
                  Being solved by{" "}
                  {currentUser?.name === task.solver.name
                    ? "You"
                    : task.solver.name}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex  w-full items-center gap-1">
                {actionButtoneCheck(task)}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  function ListView() {
    return (
      <div className="bg-white rounded-lg border">
        {filteredItretable.map((task, index) => (
          <div key={task.id}>
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      className={getColorClass(categoryMap[task.categoryId])}>
                      {categoryMap[task.categoryId] || "Unknown"}
                    </Badge>
                    {statusUiCheck(task)}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 w-full overflow-hidden">
                    <span>Posted by {task.poster.name}</span>
                    <span>{task.createdAt?.toLocaleDateString()}</span>
                    {task.deadline && <span>Due: {task.deadline}</span>}
                    {task.solver && (
                      <span className="text-green-600">
                        Solved by {task.solver.name}
                      </span>
                    )}
                    <p
                      className={getColorClass(
                        String(task.price),
                        false,
                        true
                      )}>
                      RM{task.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto ml-0 sm:ml-4 mt-4 sm:mt-0">
                  {actionButtoneCheck(task)}
                </div>
              </div>
            </div>
            {index < filteredItretable.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    );
  }
  function TableView() {
    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">
                  Task
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Category
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Author
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-gray-900">Due</th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Price
                </th>
                <th className="text-left p-4 font-medium text-gray-900">
                  Actions
                </th>
                <th className="text-left p-4 font-medium text-gray-900"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItretable.map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                        {task.description}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={getColorClass(categoryMap[task.categoryId])}>
                      {categoryMap[task.categoryId] || "Unknown"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {task.poster.name!.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.poster.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{statusUiCheck(task)}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {task.deadline || "No deadline"}
                  </td>
                  <td
                    className={getColorClass(String(task.price), false, true)}>
                    RM{task.price?.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">{actionButtoneCheck(task)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  function renderView()  {
    switch (viewMode) {
      case "list":
        return <ListView />;
      case "table":
        return <TableView />;
      default:
        return <CardsView />;
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8 ">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>
          <Badge variant="outline" className="text-foreground">
            Total: {totalCount}
          </Badge>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between  p-4 rounded-md">
          <div className="flex flex-col sm:flex-row flex-1 gap-2">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:flex-1 w-full"
            />
            <Button
              type="submit"
              className="w-full sm:w-auto whitespace-nowrap">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[200px] justify-between">
                  {selectedValue ? selectedValue : `Filter by ${filterType}`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[200px]">
                <Command>
                  <CommandInput placeholder="Search status..." />
                  <CommandEmpty>No status found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {STATUS_OPTIONS.map((status) => (
                        <CommandItem
                          key={status}
                          onSelect={() => handleSelect(status)}
                          className="cursor-pointer">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedValue === status
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {GetStatusBadge(status)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <ViewToggle />
          </div>
        </div>
        <div className="space-y-6 min-h-[500px]">
          {filteredItretable.length > 0 ? (
            renderView()
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
