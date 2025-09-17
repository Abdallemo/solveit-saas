"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskStatusType } from "@/drizzle/schemas";
import useCurrentUser from "@/hooks/useCurrentUser";
import useQueryParam from "@/hooks/useQueryParms";
import { cn, getColorClass } from "@/lib/utils";
import { debounce } from "lodash";
import {
  Check,
  ChevronsUpDown,
  Clock,
  Grid3X3,
  Search,
  SquareArrowUpRight,
  Table as TableIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  PosterTasksFiltred,
  SolverAssignedTaskType,
} from "../server/task-types";
import GetStatusBadge from "./taskStatusBadge";

type DisplayComponentProps = {
  itretable: SolverAssignedTaskType[] | PosterTasksFiltred[];
  totalCount: number;
  pages: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  filterType: "status" | "category";
  title: string;
  categoryMap: Record<string, string>;
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
type viewType = "cards" | "table";
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
  const [viewMode, setViewMode] = useQueryParam<viewType>("viewMode", "cards");
  const [viewModeState, setViewModeState] = useState<viewType>(viewMode);
  const [search, setSearch] = useQueryParam("search", "");
  const [open, setOpen] = useState(false);
  const { user: currentUser } = useCurrentUser();
  const debouncedSetSearch = useMemo(
    () =>
      debounce((val: string) => {
        setSearch(val);
      }, 500),
    [setSearch]
  );

  const searchKey =
    typeGuardIsSolver(itretables) == true || filterType == "status"
      ? "status"
      : "category";

  const [selectedValue, setSelectedValue] = useQueryParam(searchKey, "");
  function handleSelect(newVal: viewType) {
    setViewModeState(newVal);
    setViewMode(newVal);
  }

  function ViewToggle() {
    return (
      <div className="flex items-center gap-1 bg-muted rounded-md p-1">
        <Button
          variant={viewModeState === "cards" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            handleSelect("cards");
          }}>
          <Grid3X3 className="w-4 h-4 mr-1" />
          Cards
        </Button>
        <Button
          variant={viewModeState === "table" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            handleSelect("table");
          }}>
          <TableIcon className="w-4 h-4 mr-1" />
          Table
        </Button>
      </div>
    );
  }

  function statusUiCheck(task: SolverAssignedTaskType | PosterTasksFiltred) {
    return "blockedSolvers" in task &&
      task.blockedSolvers.some(
        (blocked) => blocked.userId === currentUser?.id!
      ) ? (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Canceled
      </Badge>
    ) : (
      GetStatusBadge(task.status!)
    );
  }

  function actionButtoneCheck(
    task: SolverAssignedTaskType | PosterTasksFiltred
  ) {
    return (
      <div className="flex gap-2 w-full ">
        {"blockedSolvers" in task ? (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link
                className="w-full flex-1"
                href={`/dashboard/${currentUser?.role?.toLocaleLowerCase()}/tasks/${
                  task.id
                }`}>
                <SquareArrowUpRight className="w-4 h-4 mr-1" />
                Task Overview
              </Link>
            </Button>
            <Button variant="success" size="sm" asChild>
              <Link
                href={`/dashboard/solver/workspace/start/${task.id}`}
                className="w-full flex-1">
                {task.status === "IN_PROGRESS"
                  ? "Continue Workspace"
                  : task.blockedSolvers.some(
                      (blocked) => blocked.userId === currentUser?.id
                    ) ||
                    task.status === "COMPLETED" ||
                    task.status === "SUBMITTED"
                  ? "View Workspace"
                  : "Start Workspace"}
              </Link>
            </Button>
          </>
        ) : task.status === "SUBMITTED" || task.status === "COMPLETED" ? (
          <>
            <Button size="sm" asChild>
              <Link
                className="w-full flex-1"
                href={`/dashboard/${currentUser?.role?.toLocaleLowerCase()}/tasks/${
                  task.id
                }`}>
                View Task
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                className="w-full flex-1"
                href={`/dashboard/${currentUser?.role?.toLocaleLowerCase()}/tasks/${
                  task.id
                }/solutions/${task.taskSolution.id}`}>
                <SquareArrowUpRight className="w-4 h-4 mr-1" />
                View Solution
              </Link>
            </Button>
          </>
        ) : (
          <Button size="sm" asChild>
            <Link
              className="w-full flex-1"
              href={`/dashboard/${currentUser?.role?.toLocaleLowerCase()}/tasks/${
                task.id
              }`}>
              View Task
            </Link>
          </Button>
        )}
      </div>
    );
  }

  function CardsView() {
    return (
      <div className="h-[632px] max-h-[632px]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {itretables.map((task) => (
            <Card
              key={task.id}
              className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-2 space-y-2 ">
                <div className="flex items-center justify-between">
                  <Badge className={getColorClass(task.category.name)}>
                    {task.category.name || "Unknown"}
                  </Badge>
                  {statusUiCheck(task)}
                </div>
                <CardTitle className="text-lg line-clamp-1">
                  {task.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm flex-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  {task.posterId !== currentUser?.id && (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback>
                          {task.poster.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                        <AvatarImage src={task.poster.image!} />
                      </Avatar>
                      {task.poster.name?.split(" ")[0]}
                    </div>
                  )}
                  {task.deadline && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {task.deadline}
                    </div>
                  )}
                </div>
                <p className="font-medium">RM{task.price?.toFixed(2)}</p>
                {task.solverId && task.solver && (
                  <p className="text-xs text-green-600">
                    {task.status === "COMPLETED" || task.status === "SUBMITTED"
                      ? "solved by"
                      : "Being solved by"}
                    {currentUser?.name === task.solver.name
                      ? "You"
                      : task.solver.name}
                  </p>
                )}
              </CardContent>
              <CardFooter>{actionButtoneCheck(task)}</CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function TableView() {
    return (
      <div className="flex flex-col gap-4 w-full ">
        <Table className="border rounded-lg ">
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itretables.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge className={getColorClass(task.category.name)}>
                    {task.category.name || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {task.poster.name!.slice(0, 2)}
                      </AvatarFallback>
                      <AvatarImage src={task.poster.image ?? ""} />
                    </Avatar>
                    <span className="text-sm">{task.poster.name}</span>
                  </div>
                </TableCell>
                <TableCell>{statusUiCheck(task)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {task.deadline || "No deadline"}
                </TableCell>
                <TableCell className="text-sm">
                  RM{task.price?.toFixed(2)}
                </TableCell>
                <TableCell className="text-right w-30">
                  {actionButtoneCheck(task)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="w-full flex justify-end">
          <PaginationControls
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            page={pages}
            type="table"
            className="justify-end"
          />
        </div>
      </div>
    );
  }

  function renderView() {
    return viewModeState === "table" ? <TableView /> : <CardsView />;
  }

  return (
    <div>
      <div className="mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{title}</h1>
          <Badge variant="outline">Total: {totalCount}</Badge>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <Input
              type="text"
              placeholder="Search tasks..."
              defaultValue={search}
              onChange={(e) => debouncedSetSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="shrink-0">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[200px] justify-between">
                  {selectedValue ? selectedValue : `Filter by ${filterType}`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[250px]">
                <Command>
                  <CommandInput placeholder={`Search ${filterType}...`} />
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {filterType === "category"
                        ? Object.values(categoryMap).map((category) => (
                            <CommandItem
                              key={category}
                              onSelect={() => setSelectedValue(category)}
                              className="cursor-pointer">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedValue === category
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <Badge className={cn(getColorClass(category))}>
                                {category}
                              </Badge>
                            </CommandItem>
                          ))
                        : STATUS_OPTIONS.map((status) => (
                            <CommandItem
                              key={status}
                              onSelect={() => setSelectedValue(status)}
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

        <div className="min-h-[500px]">
          {itretables.length > 0 ? (
            renderView()
          ) : (
            <div className="flex items-center justify-center text-muted-foreground py-24 border rounded-md bg-muted/30">
              No tasks found for this page or search query.
            </div>
          )}
        </div>

        {viewMode === "cards" && (
          <div className="flex justify-center">
            <PaginationControls
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              page={pages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
function PaginationControls({
  page,
  hasNext,
  hasPrevious,
  type = "regular",
  className,
}: {
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  type?: "regular" | "table";
  className?: string;
}) {
  const router = useRouter();
  const params = new URLSearchParams(useSearchParams());

  const goToPage = (newPage: number) => {
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Pagination className={cn("w-full", className)}>
      {type === "regular" ? (
        <PaginationContent>
          {hasPrevious && (
            <PaginationItem>
              <PaginationPrevious onClick={() => goToPage(page - 1)} />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink isActive>{page}</PaginationLink>
          </PaginationItem>
          {hasNext && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext onClick={() => goToPage(page + 1)} />
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      ) : (
        <PaginationContent>
          <PaginationItem>
            <Button
              variant={"outline"}
              className="h-8"
              onClick={() => goToPage(page - 1)}
              disabled={!hasPrevious}>
              Previous
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant={"outline"}
              className="h-8"
              onClick={() => goToPage(page + 1)}
              disabled={!hasNext}>
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      )}
    </Pagination>
  );
}
