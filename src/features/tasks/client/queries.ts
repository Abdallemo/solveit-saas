import { TaskStatusType } from "@/drizzle/schemas";
import {
  getAllTasksByRolePaginated,
  getPosterTasksbyIdPaginated,
  getSolverAssignedTasksbyIdPaginated,
} from "@/features/tasks/server/data";
import { UserDbType } from "@/features/users/server/actions";
import { queryOptions } from "@tanstack/react-query";

type tasksQueryParams = {
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

export const tasksQuery = (params: tasksQueryParams) =>
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
type userGrowthReturnType = {
  date: string;
  users: number;
}[];
export const userGrowthQuery = (params: {
  from: string;
  to: string;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["user-growth", params.from, params.to],
    queryFn: async () => {
      let dataToSend: userGrowthReturnType = [];
      const { from, to } = params;
      // const { from, to } = params;
      // console.log("userGrowth key", ["user-growth", from, to]);
      // const res = await getUserGrowthData(from, to); server action version
      // console.log("got response", res);
      try {
        const res = await fetch(
          `/api/admin/reports/user_growth?from=${from}&to=${to}`,
          {
            method: "GET",
          }
        );
        dataToSend = await res.json();

        return dataToSend;
      } catch (error) {
        console.log(error);
        return dataToSend;
      }
    },
  });

type revenueReturnType = {
  date: string;
  totalRevenue: number;
}[];
export const revenueQuery = (params: {
  from: string;
  to: string;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["revenue", params.from, params.to],
    queryFn: async () => {
      const { from, to } = params;
      let revenueToSend: revenueReturnType = [];

      // const { from, to } = params;
      // console.log("getRevenueData key", ["revenue", from, to]);
      // const res = await getRevenueData(from, to);//server action version
      // console.log("got response", res);
      try {
        const res = await fetch(
          `/api/admin/reports/revenue?from=${from}&to=${to}`,
          {
            method: "GET",
          }
        );
        revenueToSend = await res.json();

        return revenueToSend;
      } catch (error) {
        console.log(error);

        return revenueToSend;
      }
    },
  });
type taskCategoriesReturnType = {
  date: string;
  name: string;
  taskCount: number;
}[];
export const taskCategoriesQuery = (params: {
  from: string;
  to: string;
  enabled?: boolean;
}) =>
  queryOptions({
    queryKey: ["task-categories", params.from, params.to],
    queryFn: async () => {
      const { from, to } = params;
      let taskCategoryToSend: taskCategoriesReturnType = [];

      // const { from, to } = params;
      // console.log("taskCategoriesQuery key", ["task-categories", from, to]);
      // const res = await getTaskCategoriesData(from, to);//server action verison
      // console.log("got response", res);
      try {
        const res = await fetch(
          `/api/admin/reports/task_categories?from=${from}&to=${to}`,
          {
            method: "GET",
          }
        );
        taskCategoryToSend = await res.json();
        return taskCategoryToSend;
      } catch (error) {
        console.log(error);

        return taskCategoryToSend;
      }
    },
  });
