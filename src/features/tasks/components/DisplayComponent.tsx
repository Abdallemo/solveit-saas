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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TaskStatusType } from "@/drizzle/schemas";
import {
  PosterTasksFiltred,
  SolverAssignedTaskType,
} from "@/features/tasks/server/task-types";
import useQueryParam from "@/hooks/useQueryParms";
import { cn, getColorClass } from "@/lib/utils";
import { debounce } from "lodash";
import {
  Check,
  ChevronsUpDown,
  Clock,
  Search,
  SquareArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import TaskLoading from "@/app/dashboard/solver/tasks/loading";
import { UserDbType } from "@/features/users/server/actions";
import { useQuery } from "@tanstack/react-query";
import { tasksQuery } from "../client/queries";
import PaginationControls from "./PaginatedControls";
import GetStatusBadge from "./taskStatusBadge";

type DisplayComponentProps = {
  filterType: "status" | "category";
  title: string;
  categoryMap: Record<string, string>;
  type: "PosterTasks" | "AllTasks" | "SolverTasks";
  currentUser: UserDbType;
  limit: number;
};

const STATUS_OPTIONS: TaskStatusType[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "SUBMITTED",
];

export default function DisplayListComponent({
  categoryMap,
  title,
  filterType,
  type,
  currentUser,
  limit,
}: DisplayComponentProps) {
  const [search, setSearch] = useQueryParam("search", "");
  const [selectedValue, setSelectedValue] = useQueryParam(filterType, "");
  const [page, setPage] = useQueryParam("page", 1);
  const [open, setOpen] = useState(false);
  const offset = (page - 1) * limit;
  const { data, isLoading, error } = useQuery(
    tasksQuery({
      title,
      search,
      selectedValue,
      type,
      currentUser,
      limit,
      offset,
      status: selectedValue as TaskStatusType,
      categoryMap,
    })
  );

  const debouncedSetSearch = useMemo(
    () =>
      debounce((val: string) => {
        setSearch(val);
      }, 500),
    [setSearch]
  );

  if (isLoading) {
    return <TaskLoading />;
  }
  if (error) {
    throw error;
  }
  const tasks = data ? data.tasks : [];
  const totalCount = data ? data.totalCount : 1;
  const hasPrevious = page > 1;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNext = page < totalPages;

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
      <div className="flex-1">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tasks.map((task) => (
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

  return (
    <div className="flex flex-col px-6 py-8 gap-4 w-full h-full">
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

        <div className="sm:flex gap-2 items-center sm:w-fit">
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
                            onSelect={() =>
                              setSelectedValue(
                                selectedValue === category ? "" : category
                              )
                            }
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
                            onSelect={() =>
                              setSelectedValue(
                                selectedValue === status ? "" : status
                              )
                            }
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
        </div>
      </div>

      {tasks.length > 0 ? (
        <>
          <CardsView />
        </>
      ) : (
        <div className="flex items-center justify-center text-muted-foreground py-24 border rounded-md bg-muted/30">
          No tasks found for this page or search query.
        </div>
      )}
      {(hasNext||hasPrevious) && (
        <PaginationControls
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          page={page}
          setPage={setPage}
        />
      )}
    </div>
  );
}
