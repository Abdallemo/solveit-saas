"use client";

import type React from "react";
import { cn, getColorClass } from "@/lib/utils";
import {
  Calendar,
  Search,
  SquareArrowUpRight,
  User,
  Grid3X3,
  List,
  Table,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  ChevronsUpDown,
  Check,
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
import { PosterTasksFiltred } from "../server/task-types";
import { TaskCategoryType, TaskStatusType } from "@/drizzle/schemas";

import { useSearchParams, useRouter } from "next/navigation";
type Props = {
  tasks: PosterTasksFiltred[];
  totalCount: number;
  categoryMap: Record<string, string>;
  pages: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function AllTasksPageComps({
  tasks,
  totalCount,
  categoryMap,
  pages,
  totalPages,
  hasPrevious,
  hasNext,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  const [search, setSearch] = useState("");
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);

  const { user: currentUser } = user;
  const selectedCategory = useMemo(() => {
    return (searchParams.get("category") as TaskCategoryType["name"]) ?? "";
  }, [searchParams]);

  const CATEGORYIES: TaskCategoryType["name"][] = Object.values(categoryMap);

  const handleSelect = (category: TaskCategoryType["name"]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === selectedCategory) {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.replace(`?${params.toString()}`);
    setOpen(false);
  };

  const filteredTasks = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return tasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(lowerSearch) ||
        task.description?.toLowerCase().includes(lowerSearch);

      const matchCategory =
        !selectedCategory || categoryMap[task.categoryId] === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory, tasks, categoryMap]);

  const ViewToggle = () => (
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

  const CardsView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredTasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <Badge className={getColorClass(categoryMap[task.categoryId])}>
                {categoryMap[task.categoryId] || "Unknown"}
              </Badge>

              {currentUser?.role == "SOLVER" ? (
                <Badge className={getColorClass(String(task.price))}>
                  RM{task.price?.toFixed(2)}
                </Badge>
              ) : null}
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
            </div>
            <div className="text-xs text-gray-400 mb-2">
              Posted: {task.createdAt?.toLocaleDateString()}
            </div>
            {task.solverId && task.solver && (
              <div className="text-sm text-green-600">
                Being solved by {task.solver.name}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex gap-2 w-full">
              {(task.status === "SUBMITTED" || task.status === "COMPLETED") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  asChild>
                  <Link
                    href={`/dashboard/tasks/${task.id}/solutions/${task.taskSolution.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-green-600 font-semibold">
                      View Solution
                    </span>
                  </Link>
                </Button>
              )}
              <Button
                size="sm"
                className={`${
                  task.status === "SUBMITTED" || task.status === "COMPLETED"
                    ? "flex-1"
                    : "w-full"
                }`}
                asChild>
                <Link href={`/dashboard/tasks/${task.id}`}>View Details</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-lg border">
      {filteredTasks.map((task, index) => (
        <div key={task.id}>
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    className={getColorClass(categoryMap[task.categoryId])}>
                    {categoryMap[task.categoryId] || "Unknown"}
                  </Badge>
                  {currentUser?.role == "SOLVER" ? (
                    <Badge className={getColorClass(String(task.price))}>
                      RM{task.price?.toFixed(2)}
                    </Badge>
                  ) : null}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {task.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Posted by {task.poster.name}</span>
                  <span>{task.createdAt?.toLocaleDateString()}</span>
                  {task.deadline && <span>Due: {task.deadline}</span>}
                  {task.solver && (
                    <span className="text-green-600">
                      Solved by {task.solver.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {(task.status === "SUBMITTED" ||
                  task.status === "COMPLETED") && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/tasks/${task.id}/solutions/${task.taskSolution.id}`}>
                      <SquareArrowUpRight className="w-4 h-4 mr-1" />
                      View Solution
                    </Link>
                  </Button>
                )}
                <Button size="sm" asChild>
                  <Link href={`/dashboard/tasks/${task.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
          {index < filteredTasks.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-900">Task</th>
              <th className="text-left p-4 font-medium text-gray-900">
                Category
              </th>
              <th className="text-left p-4 font-medium text-gray-900">
                Author
              </th>
              {currentUser?.role === "SOLVER" && (
                <th className="text-left p-4 font-medium text-gray-900">
                  Price
                </th>
              )}
              <th className="text-left p-4 font-medium text-gray-900">Due</th>
              <th className="text-left p-4 font-medium text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
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
                <td className="p-4">
                  {currentUser?.role == "SOLVER" ? (
                    <Badge className={getColorClass(String(task.price))}>
                      RM{task.price?.toFixed(2)}
                    </Badge>
                  ) : null}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {task.deadline || "No deadline"}
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {(task.status === "SUBMITTED" ||
                      task.status === "COMPLETED") && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/tasks/${task.id}/solutions/${task.taskSolution.id}`}>
                          Solution
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/tasks/${task.id}`}>Details</Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderView = () => {
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">
            {currentUser?.role == "POSTER"
              ? "Public Tasks"
              : "Available Tasks & Jobs"}
          </h1>
          <Badge variant="outline" className="text-foreground">
            Total: {totalCount}
          </Badge>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ">
          <div className="flex items-center gap-2 flex-1 w-2xl  ">
            <Input
              type="text"
              placeholder={
                currentUser?.role == "POSTER"
                  ? "Search Public tasks..."
                  : "Search Available tasks..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-1">
              <Button type="submit" className="whitespace-nowrap">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[200px] justify-between">
                    {selectedCategory || "Filter by status"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[200px]">
                  <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {CATEGORYIES.map((category) => (
                          <CommandItem
                            key={category}
                            onSelect={() => handleSelect(category)}
                            className="cursor-pointer">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategory === category
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <Badge className={getColorClass(category)}>
                              {category}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <ViewToggle />
        </div>

        <div className="space-y-6 min-h-[500px]">
          {filteredTasks.length > 0 ? (
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
