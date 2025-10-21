import { TaskStatusType } from "@/drizzle/schemas";
import {
  getAllTasksByRolePaginated,
  getPosterTasksbyIdPaginated,
  getSolverAssignedTasksbyIdPaginated,
} from "@/features/tasks/server/data";
import { UserDbType } from "@/features/users/server/actions";
import { queryOptions } from "@tanstack/react-query";

type QueryParams = {
  title: string;
  search: string;
  selectedValue: string;
  type: "PosterTasks" | "AllTasks" | "SolverTasks";
  currentUser: UserDbType;
  limit: number;
  offset: number;
  status?: TaskStatusType;
  categoryMap: Record<string, string>;
};

export const tasksQuery = (params: QueryParams) =>
  queryOptions({
    queryKey: [
      "tasks",
      {
        title: params.title,
        search: params.search,
        selectedValue: params.selectedValue,
        type: params.type,
        offset: params.offset,
        limit: params.limit,
      },
    ],
    queryFn: async () => {
      const {
        type,
        currentUser,
        search,
        limit,
        offset,
        selectedValue,
        status,
        categoryMap,
      } = params;

      if (type === "PosterTasks") {
        return await getPosterTasksbyIdPaginated(currentUser.id, {
          search,
          limit,
          offset,
          status: (selectedValue as TaskStatusType) ?? "",
        });
      }

      if (type === "AllTasks") {
        return await getAllTasksByRolePaginated(
          currentUser.id,
          currentUser.role!,
          {
            search,
            limit,
            offset,
            categoryId:
              Object.keys(categoryMap).find(
                (key) => categoryMap[key] === selectedValue
              ) ?? "",
          }
        );
      }

      return await getSolverAssignedTasksbyIdPaginated(
        currentUser.id,
        {
          search,
          limit,
          offset,
          status: (status as TaskStatusType) ?? "",
        },
        true
      );
    },
  });
