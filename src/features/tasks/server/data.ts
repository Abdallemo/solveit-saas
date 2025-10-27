"use server";
import db from "@/drizzle/db";
import {
  MentorshipBookingTable,
  MentorshipSessionTable,
  PaymentTable,
  RefundTable,
  TaskCategoryTable,
  TaskDeadlineTable,
  TaskDraftTable,
  TaskStatusType,
  TaskTable,
  UserRoleType,
  UserSubscriptionTable,
  UserTable,
} from "@/drizzle/schemas";
import { generateSqlYMDFormateDate } from "@/drizzle/utils";
import { isAuthorized } from "@/features/auth/server/actions";
import type {
  dataOptions,
  FlatDispute,
  PosterTaskReturn,
  SolverStats,
  SolverTaskReturn,
  Units,
} from "@/features/tasks/server/task-types";
import { publicUserColumns } from "@/features/users/server/user-types";
import { withCache } from "@/lib/cache";
import { logger } from "@/lib/logging/winston";
import { toYMD } from "@/lib/utils";
import { formatDistance, isPast, subDays } from "date-fns";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  ilike,
  inArray,
  not,
  notExists,
  or,
  sql,
  sum,
} from "drizzle-orm";
import { unionAll } from "drizzle-orm/pg-core";
import isUUID from "validator/es/lib/isUUID";
import { calculateTaskProgressV2 } from "./action";

export async function getBlockedSolver(solverId: string, taskId: string) {
  console.log(`[getBlockedSolver]: solverId=${solverId},TaskId=${taskId}`);
  const result = db.query.BlockedTasksTable.findFirst({
    where: (table, fn) =>
      fn.and(fn.eq(table.userId, solverId), fn.eq(table.taskId, taskId)),
  });
  console.log(`[found] ${result}`);
  return [result][0];
}
export async function getAllTaskCatagories(
  options: dataOptions = { useCache: true }
) {
  return await withCache({
    callback: async () => {
      const all = await db
        .select({
          id: TaskCategoryTable.id,
          name: TaskCategoryTable.name,
          createdAt: TaskCategoryTable.createdAt,
          taskCount: count(TaskTable.id),
        })
        .from(TaskCategoryTable)
        .leftJoin(TaskTable, eq(TaskTable.categoryId, TaskCategoryTable.id))
        .groupBy(TaskCategoryTable.id);
      return all;
    },
    tag: "category-data-cache",
    enabled: options.useCache,
  })();
}
export async function getAllTaskDeadlines(
  options: dataOptions = { useCache: true }
) {
  return await withCache({
    callback: async () => {
      const all = await db
        .select({
          id: TaskDeadlineTable.id,
          deadline: TaskDeadlineTable.deadline,
          createdAt: TaskDeadlineTable.createdAt,
          taskCount: count(TaskTable.id),
        })
        .from(TaskDeadlineTable)
        .leftJoin(TaskTable, eq(TaskTable.deadline, TaskDeadlineTable.deadline))
        .groupBy(TaskDeadlineTable.id);
      return all;
    },
    tag: "deadline-data-cache",
    enabled: options.useCache,
  })();
}

export async function getTaskCatagoryId(name: string) {
  const catagoryId = await db.query.TaskCategoryTable.findFirst({
    where: (table, fn) => fn.eq(table.name, name),
    columns: { id: true },
  });
  return catagoryId;
}
export async function getAllCategoryMap(): Promise<Record<string, string>> {
  const categories = await getAllTaskCatagories();

  return Object.fromEntries(categories.map((cat) => [cat.id, cat.name]));
}
export async function getWalletInfo(solverId: string) {
  if (!solverId) {
    throw new Error("error! user id is empty");
  }
  const tasks = await db
    .select()
    .from(TaskTable)
    .where(
      and(
        eq(TaskTable.solverId, solverId),
        notExists(
          db
            .select()
            .from(RefundTable)
            .where(
              and(
                eq(RefundTable.taskId, TaskTable.id),
                eq(RefundTable.refundStatus, "REFUNDED")
              )
            )
        )
      )
    );

  let pending = 0;
  let available = 0;
  for (const task of tasks) {
    switch (task.status) {
      case "ASSIGNED":
      case "IN_PROGRESS":
      case "SUBMITTED":
        pending += task.price ?? 0;
        break;
      case "COMPLETED":
        available += task.price ?? 0;
        break;
    }
  }

  return { pending, available };
}
export async function getUserTasksbyId(userId: string) {
  const userTasks = await db.query.TaskTable.findMany({
    where: (table, fn) => fn.eq(table.posterId, userId),
    orderBy: [asc(TaskTable.title)],
  });
  return userTasks;
}
export async function getTasksbyId(id: string) {
  if (!isUUID(id, "4")) {
    return null;
  }
  try {
    const Task = await db.query.TaskTable.findFirst({
      where: (table, fn) => fn.eq(table.id, id),
      with: {
        poster: { columns: publicUserColumns },
        solver: { columns: publicUserColumns },
        workspace: true,
      },
    });
    if (!Task || !Task.id) return null;
    return Task;
  } catch (error) {
    return null;
  }
}

type SpecificRole = Exclude<UserRoleType, "ADMIN" | "MODERATOR">;

export async function getTasksbyIdWithFiles(
  id: string,
  role: "POSTER"
): Promise<PosterTaskReturn | null>;

export async function getTasksbyIdWithFiles(
  id: string,
  role: "SOLVER"
): Promise<SolverTaskReturn | null>;

export async function getTasksbyIdWithFiles(
  id: string,
  role: SpecificRole
): Promise<PosterTaskReturn | SolverTaskReturn | null> {
  if (!isUUID(id, "4")) {
    return null;
  }
  try {
    switch (role) {
      case "POSTER":
        return (
          ((await db.query.TaskTable.findFirst({
            where: (table, fn) => fn.eq(table.id, id),
            with: {
              taskFiles: true,
            },
          })) as PosterTaskReturn | null) ?? null
        );

      case "SOLVER":
        const t = await db.query.TaskTable.findFirst({
          where: (table, fn) => fn.eq(table.id, id),
          with: {
            poster: { columns: publicUserColumns },
            taskFiles: true,
            blockedSolvers: true,
          },
        });
        return t
          ? ({ ...t, blockedSolvers: t?.blockedSolvers[0] } as SolverTaskReturn)
          : null;
    }
  } catch (error) {
    return null;
  }
}

export async function getAllTasks() {
  const allTasksFiltred = db.query.TaskTable.findMany({
    where: (table, fn) =>
      fn.and(
        fn.not(fn.eq(table.status, "IN_PROGRESS")),
        fn.not(fn.eq(table.status, "ASSIGNED"))
      ),
    with: {
      poster: { columns: publicUserColumns },
      solver: { columns: publicUserColumns },
      workspace: true,
    },
  });
  return allTasksFiltred;
}
export async function getPosterTasksbyIdPaginated(
  userId: string,
  {
    search,
    limit,
    offset,
    categoryId,
    status,
  }: {
    search?: string;
    categoryId?: string;
    limit: number;
    offset: number;
    status: TaskStatusType;
  }
) {
  const where = and(
    eq(TaskTable.posterId, userId),
    search ? ilike(TaskTable.title, `%${search}%`) : undefined,
    status ? eq(TaskTable.status, status) : undefined
  );

  const [tasks, totalCountResult] = await Promise.all([
    db.query.TaskTable.findMany({
      where,
      limit,
      offset,
      orderBy: (table, fn) => fn.desc(table.updatedAt),
      with: {
        poster: { columns: publicUserColumns },
        solver: { columns: publicUserColumns },
        taskSolution: true,
        category: true,
      },
    }),
    db.select({ count: count() }).from(TaskTable).where(where),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { tasks, totalCount };
}
export async function getSolverAssignedTasksbyIdPaginated(
  userId: string,
  {
    search,
    limit,
    offset,
    status,
  }: { search?: string; limit: number; offset: number; status: TaskStatusType },
  showBlocked: boolean
) {
  const blockedTasks = await db.query.BlockedTasksTable.findMany({
    with: { task: true },
    where: (table, fn) => fn.eq(table.userId, userId),
  });
  const blockedTaskIds = blockedTasks.map((t) => t.taskId);

  const where = and(
    or(
      eq(TaskTable.solverId, userId),
      showBlocked ? inArray(TaskTable.id, blockedTaskIds) : undefined
    ),
    search ? ilike(TaskTable.title, `%${search}%`) : undefined,
    status ? eq(TaskTable.status, status) : undefined
  );

  const [tasks, totalCountResult] = await Promise.all([
    db.query.TaskTable.findMany({
      where,
      limit,
      offset,
      orderBy: (table, fn) => fn.desc(table.updatedAt),
      with: {
        workspace: true,
        poster: { columns: publicUserColumns },
        solver: { columns: publicUserColumns },
        blockedSolvers: true,
        category: true,
        taskFiles: true,
      },
    }),
    db.select({ count: count() }).from(TaskTable).where(where),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { tasks, totalCount };
}
export async function getAllTasksByRolePaginated(
  userId: string,
  role: UserRoleType,
  {
    search,
    limit,
    offset,
    categoryId,
  }: {
    search?: string;
    categoryId?: string;
    limit: number;
    offset: number;
  }
) {
  let where;
  const blockedTasks = await db.query.BlockedTasksTable.findMany({
    with: { task: true },
    where: (table, fn) => fn.eq(table.userId, userId),
  });
  const blockedTaskIds = blockedTasks.map((t) => t.taskId);

  if (role === "POSTER") {
    where = and(
      not(eq(TaskTable.posterId, userId)),

      eq(TaskTable.visibility, "public"),
      or(eq(TaskTable.status, "OPEN"), eq(TaskTable.status, "COMPLETED")),
      search
        ? or(
            ilike(TaskTable.title, `%${search}%`),
            ilike(TaskTable.description, `%${search}%`),
            ilike(TaskTable.deadline, `%${search}%`)
          )
        : undefined,
      categoryId ? eq(TaskTable.categoryId, categoryId) : undefined
    );
  } else if (role === "SOLVER") {
    where = and(
      blockedTaskIds.length > 0
        ? not(inArray(TaskTable.id, blockedTaskIds))
        : undefined,
      not(eq(TaskTable.posterId, userId)),
      and(eq(TaskTable.status, "OPEN")),
      search
        ? or(
            ilike(TaskTable.title, `%${search}%`),
            ilike(TaskTable.description, `%${search}%`),
            ilike(TaskTable.deadline, `%${search}%`)
          )
        : undefined,
      categoryId ? eq(TaskTable.categoryId, categoryId) : undefined
    );
  }

  const [tasks, totalCountResult] = await Promise.all([
    db.query.TaskTable.findMany({
      where,
      limit,
      offset,
      orderBy: (table, fn) => fn.desc(table.updatedAt),
      with: {
        poster: { columns: publicUserColumns },
        solver: { columns: publicUserColumns },
        taskSolution: true,
        category: true,
      },
    }),
    db.select({ count: count() }).from(TaskTable).where(where),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { tasks, totalCount };
}
export async function getTaskFilesById(taskId: string) {
  const files = await db.query.TaskFileTable.findMany({
    where: (table, fn) => fn.eq(table.taskId, taskId),
  });
  return files;
}
export async function getDraftTaskWithDefualtVal(userId: string) {
  const oldTask = await db.query.TaskDraftTable.findFirst({
    where: (table, fn) => fn.eq(table.userId, userId),
  });
  // if (!oldTask) return null;
  if (!oldTask) {
    return null;
  } else {
    return {
      id: oldTask.id,
      userId: oldTask.userId,
      title: oldTask.title ?? "",
      description: oldTask.description ?? "",
      content: oldTask.content ?? "",
      contentText: oldTask.contentText ?? "",
      deadline: oldTask.deadline ?? "12h",
      visibility: oldTask.visibility ?? "public",
      category: oldTask.category ?? "",
      price: oldTask.price ?? 10,
      updatedAt: oldTask.updatedAt,
      uploadedFiles: oldTask.uploadedFiles ?? [],
    };
  }
}
export async function getDraftTask(userId: string, draftId: string) {
  const oldTask = await db.query.TaskDraftTable.findFirst({
    where: (table, fn) =>
      fn.and(eq(table.userId, userId), eq(table.id, draftId)),
  });
  if (!oldTask) {
    return null;
  }
  return {
    ...oldTask,
  };
}
export async function deleteDraftTask(userId: string) {
  const res = await db
    .delete(TaskDraftTable)
    .where(eq(TaskDraftTable.userId, userId))
    .returning();
  logger.info("deleted task draft from user: " + userId, { result: res });
}
export async function getWorkspaceByTaskId(taskId: string, solverId: string) {
  const workspace = await db.query.WorkspaceTable.findFirst({
    where: (table, fn) =>
      fn.and(fn.eq(table.taskId, taskId), fn.eq(table.solverId, solverId)),
    with: {
      solver: { columns: publicUserColumns },
      task: true,
    },
  });
  return workspace;
}
export async function getWorkspaceById(workspaceId: string, solverId: string) {
  const workspace = await db.query.WorkspaceTable.findFirst({
    where: (table, fn) =>
      fn.and(fn.eq(table.id, workspaceId), fn.eq(table.solverId, solverId)),
    with: {
      solver: true,
      task: {
        with: {
          solver: { columns: publicUserColumns },
          poster: { columns: publicUserColumns },
          workspace: true,
          category: true,
          taskComments: {
            with: {
              owner: { columns: publicUserColumns },
            },
          },
        },
      },
      workspaceFiles: true,
    },
  });
  return workspace;
}
export async function getPosterStats(range: string = "7 days") {
  const { user } = await isAuthorized(["POSTER"]);
  if (!user?.id) return [];
  const taskStats = db
    .select({
      date: sql<string>`to_char(${TaskTable.createdAt}, 'YYYY-MM-DD')`.as(
        "date"
      ),
      postedTasks: count(TaskTable.id).as("postedTasks"),
      mentorSessions: sql<number>`0`.as("mentorSessions"),
      expenses: sum(TaskTable.price).as("expenses"),
    })
    .from(TaskTable)
    .where(
      and(
        eq(TaskTable.posterId, user.id),
        sql`${TaskTable.createdAt} > current_date - interval '7 days'`
      )
    )
    .groupBy(sql`to_char(${TaskTable.createdAt}, 'YYYY-MM-DD')`);

  const mentorStats = db
    .select({
      date: sql<string>`to_char(${MentorshipBookingTable.createdAt}, 'YYYY-MM-DD')`.as(
        "date"
      ),
      postedTasks: sql<number>`0`.as("postedTasks"),
      mentorSessions: count(MentorshipBookingTable.id).as("mentorSessions"),
      expenses: sum(MentorshipBookingTable.price).as("expenses"),
    })
    .from(MentorshipBookingTable)
    .where(
      and(
        eq(MentorshipBookingTable.posterId, user.id),
        sql`${MentorshipBookingTable.createdAt} > current_date - interval '7 days'`
      )
    )
    .groupBy(sql`to_char(${MentorshipBookingTable.createdAt}, 'YYYY-MM-DD')`);

  const merged = unionAll(taskStats, mentorStats).as("merged");

  const result = await db
    .select({
      date: merged.date,
      postedTasks: sum(merged.postedTasks),
      mentorSessions: sum(merged.mentorSessions),
      expenses: sum(merged.expenses),
    })
    .from(merged)
    .groupBy(merged.date)
    .orderBy(merged.date);

  return result.map((res) => {
    return {
      ...res,
      expenses: Number(res.expenses),
      mentorSessions: Number(res.mentorSessions),
      postedTasks: Number(res.postedTasks),
    };
  });
}
export async function getSolverStats(
  range = "30 days"
): Promise<SolverStats[]> {
  const { user } = await isAuthorized(["SOLVER"]);
  try {
    const taskStats = db
      .select({
        date: sql<string>`to_char(${TaskTable.createdAt}, 'YYYY-MM-DD')`.as(
          "date"
        ),
        allTasks: count(TaskTable.id).as("allTasks"),
        solvedTasks: sql<number>`sum(
        case when ${TaskTable.status} = 'COMPLETED' then 1 else 0 end
      )`.as("solvedTasks"),
        inProgressTasks: sql<number>`sum(
        case when ${TaskTable.status} = 'IN_PROGRESS' then 1 else 0 end
      )`.as("inProgressTasks"),
        mentorSessions: sql<number>`0`.as("mentorSessions"),
        earnings: sum(TaskTable.price).as("earnings"),
      })
      .from(TaskTable)
      .where(
        and(
          eq(TaskTable.solverId, user.id),
          sql`${TaskTable.createdAt} > current_date - interval '30 days'`
        )
      )
      .groupBy(sql`to_char(${TaskTable.createdAt}, 'YYYY-MM-DD')`);

    const mentorStats = db
      .select({
        date: sql<string>`to_char(${MentorshipBookingTable.createdAt}, 'YYYY-MM-DD')`.as(
          "date"
        ),
        allTasks: sql<number>`0`.as("allTasks"),
        solvedTasks: sql<number>`0`.as("solvedTasks"),
        inProgressTasks: sql<number>`0`.as("inProgressTasks"),
        mentorSessions: count(MentorshipSessionTable.id).as("mentorSessions"),
        earnings: sum(MentorshipBookingTable.price).as("earnings"),
      })
      .from(MentorshipBookingTable)
      .leftJoin(
        MentorshipSessionTable,
        eq(MentorshipBookingTable.id, MentorshipSessionTable.bookingId)
      )
      .where(
        and(
          eq(MentorshipBookingTable.solverId, user.id),
          sql`${MentorshipBookingTable.createdAt} > current_date - interval '7 days'`
        )
      )
      .groupBy(sql`to_char(${MentorshipBookingTable.createdAt}, 'YYYY-MM-DD')`);

    const merged = unionAll(taskStats, mentorStats).as("merged");

    const result = await db
      .select({
        date: merged.date,
        allTasks: sum(merged.allTasks).as("allTasks"),
        solvedTasks: sum(merged.solvedTasks).as("solvedTasks"),
        inProgressTasks: sum(merged.inProgressTasks).as("inProgressTasks"),
        mentorSessions: sum(merged.mentorSessions).as("mentorSessions"),
        earnings: sum(merged.earnings).as("earnings"),
      })
      .from(merged)
      .groupBy(merged.date)
      .orderBy(merged.date);

    return result.map((res) => ({
      ...res,
      earnings: Number(res.earnings) || 0,
      mentorSessions: Number(res.mentorSessions) || 0,
      allTasks: Number(res.allTasks) || 0,
      solvedTasks: Number(res.solvedTasks) || 0,
      inProgressTasks: Number(res.inProgressTasks) || 0,
    }));
  } catch (error) {
    logger.error("unable to load solver stats", {
      message: (error as Error).message,
      cause: (error as Error).cause,
    });
    return [];
  }
}

const tMap: Record<Units, string> = {
  d: "day",
  h: "hours",
  m: "months",
  w: "weeks",
  y: "years",
};

export type upcomingTasks = {
  id: string;
  title: string;
  due: string;
  totalTime: number;
  timePassed: number;
  unit: Units;
  deadlineDate: Date;
};
export async function getSolverUpcomminDeadlines(): Promise<upcomingTasks[]> {
  const { user } = await isAuthorized(["SOLVER"]);
  const now = new Date();

  const tasks = await db.query.TaskTable.findMany({
    columns: { id: true, title: true, deadline: true },
    where: (tb, fn) =>
      fn.and(fn.eq(tb.solverId, user.id), fn.isNotNull(tb.assignedAt)),
    orderBy: (tb, fn) => fn.desc(tb.updatedAt),
  });

  const result = await Promise.all(
    tasks.map(async (task) => {
      const progress = await calculateTaskProgressV2(user.id, task.id);
      const { timePassed, totalTime, deadline } = progress;

      if (!deadline || timePassed === null || totalTime === null) {
        return null;
      }
      if (isPast(deadline)) {
        return {
          id: task.id,
          due: "Passed",
          title: task.title,
          totalTime,
          timePassed,
          unit: "d",
          deadlineDate: deadline,
        };
      }
      const due = formatDistance(deadline, now, { addSuffix: true });
      const match = task.deadline.toLowerCase().match(/^(\d+)([hdwmy])$/);
      const unit = match ? (match[2] as Units) : "d";

      return {
        id: task.id,
        title: task.title,
        due,
        totalTime,
        timePassed,
        unit: unit,
        deadlineDate: deadline,
      };
    })
  );

  return result.filter((t): t is upcomingTasks => t !== null);
}

export async function getAdminStats(range: string = "30 days") {
  const { user } = await isAuthorized(["ADMIN"]);
  if (!user?.id) return [];

  const users = db
    .select({
      date: sql<string>`to_char(${UserTable.createdAt}, 'YYYY-MM-DD')`.as(
        "date"
      ),
      users: count(UserTable.id).mapWith(Number).as("users"),
      newUsers:
        sql<number>`sum(case when ${UserTable.createdAt} > current_date - interval '7 days' then 1 else 0 end)`.as(
          "newUsers"
        ),
      revenue: sql<number>`0`.as("revenue"),
      subscriptions: sql<number>`0`.as("subscriptions"),
    })
    .from(UserTable)
    .where(sql`${UserTable.createdAt} > current_date - interval '30 days'`)
    .groupBy(sql`to_char(${UserTable.createdAt}, 'YYYY-MM-DD')`);

  const revenue = db
    .select({
      date: sql<string>`to_char(${PaymentTable.createdAt}, 'YYYY-MM-DD')`.as(
        "date"
      ),
      users: sql<number>`0`.as("users"),
      newUsers: sql<number>`0`.as("newUsers"),
      revenue: sum(PaymentTable.amount).mapWith(Number).as("revenue"),
      subscriptions: sql<number>`0`.as("subscriptions"),
    })
    .from(PaymentTable)
    .where(sql`${PaymentTable.createdAt} > current_date - interval '30 days'`)
    .groupBy(sql`to_char(${PaymentTable.createdAt}, 'YYYY-MM-DD')`);

  const subs = db
    .select({
      date: sql<string>`to_char(${UserSubscriptionTable.createdAt}, 'YYYY-MM-DD')`.as(
        "date"
      ),
      users: sql<number>`0`.as("users"),
      newUsers: sql<number>`0`.as("newUsers"),
      revenue: sql<number>`0`.as("revenue"),
      subscriptions: countDistinct(
        UserSubscriptionTable.stripeSubscriptionItemId
      )
        .mapWith(Number)
        .as("subscriptions"),
    })
    .from(UserSubscriptionTable)
    .where(
      sql`${UserSubscriptionTable.createdAt} > current_date - interval '30 days'`
    )
    .groupBy(sql`to_char(${UserSubscriptionTable.createdAt}, 'YYYY-MM-DD')`);

  const merged = unionAll(users, revenue, subs).as("merged");

  const result = await db
    .select({
      date: merged.date,
      users: sum(merged.users).as("users"),
      newUsers: sum(merged.newUsers).as("newUsers"),
      revenue: sum(merged.revenue).as("revenue"),
      subscriptions: sum(merged.subscriptions).as("subscriptions"),
    })
    .from(merged)
    .groupBy(merged.date)
    .orderBy(merged.date);

  return result.map((res) => ({
    date: res.date,
    users: Number(res.users) || 0,
    newUsers: Number(res.newUsers) || 0,
    revenue: Number(res.revenue) || 0,
    subscriptions: Number(res.subscriptions) || 0,
  }));
}
async function AllDisputes() {
  return await db.query.RefundTable.findMany({
    with: {
      taskRefund: {
        with: {
          taskRefund: true,
          taskSolution: true,
          poster: { columns: publicUserColumns },
          solver: { columns: publicUserColumns },
        },
      },
      refundModerator: true,
    },
  });
}
export async function getAllDisputes(
  options: dataOptions = { useCache: true }
): Promise<FlatDispute[]> {
  const allDisputes = await withCache({
    callback: () => AllDisputes(),
    tag: "dispute-data-cache",
    enabled: options.useCache,
  })();
  return allDisputes.map((dispute) => ({
    id: dispute.id ?? null,
    refundReason: dispute.refundReason ?? null,
    refundedAt: dispute.refundedAt ?? null,
    createdAt: dispute.createdAt ?? null,
    paymentId: dispute.paymentId ?? null,
    taskId: dispute.taskId ?? null,
    refundStatus: dispute.refundStatus,
    assignedAt: dispute.taskRefund.assignedAt ?? null,
    taskPaymentId: dispute.taskRefund.paymentId ?? null,
    taskTitle: dispute.taskRefund.title ?? null,
    taskPrice: dispute.taskRefund.price ?? null,
    moderatorName: dispute.refundModerator?.name ?? null,
    moderatorEmail: dispute.refundModerator?.email ?? null,
    posterName: dispute.taskRefund.poster.name ?? null,
    posterEmail: dispute.taskRefund.poster.email ?? null,
    solverName: dispute.taskRefund.solver?.name ?? null,
    solverEmail: dispute.taskRefund.solver?.email ?? null,
    solutionContent: dispute.taskRefund.taskSolution.content,
  }));
}
export async function getSolutionById(solutionId: string) {
  if (!solutionId) {
    throw new Error("Solution Id is undefined");
  }

  const solution = await db.query.SolutionTable.findFirst({
    where: (table, fn) => fn.eq(table.id, solutionId),
    with: {
      taskSolution: {
        with: {
          solver: { columns: publicUserColumns },
          taskSolution: true,
          taskRefund: true,
          taskComments: {
            with: {
              owner: {
                columns: publicUserColumns,
              },
            },
          },
        },
      },
      solutionFiles: {
        with: {
          solutionFile: true,
        },
      },
    },
  });
  if (!solution) {
    throw new Error("Sorry No such Solution for this Task!");
  }
  //todo ill think of other latter
  return solution;
}
export async function getUserDisputes() {
  const { user } = await isAuthorized(["POSTER", "SOLVER"]);

  const userTasksWithRefund = await db
    .select({
      tasks: TaskTable,
      refunds: RefundTable,
    })
    .from(TaskTable)
    .innerJoin(RefundTable, eq(RefundTable.taskId, TaskTable.id))
    .where(or(eq(TaskTable.posterId, user.id), eq(TaskTable.solverId, user.id)))
    .orderBy(desc(RefundTable.createdAt));

  return userTasksWithRefund;
}
export async function getModeratorDisputes(disputeId: string) {
  const { user } = await isAuthorized(["MODERATOR"]);
  try {
    const dispute = await db.query.RefundTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, disputeId),
      with: {
        taskRefund: {
          columns: {
            id: false,
            createdAt: false,
          },
          with: {
            taskComments: true,
            poster: { columns: publicUserColumns },
            solver: { columns: publicUserColumns },
            taskSolution: {
              with: {
                solutionFiles: {
                  with: {
                    solutionFile: true,
                  },
                },
              },
            },
            taskFiles: true,
          },
        },
        refundModerator: true,
      },
    });
    if (!dispute) {
      return null;
    }

    return dispute;
  } catch (error) {
    return null;
  }
}

export async function getUserGrowthData(from: string, to: string) {
  if (!from) {
    from = toYMD(subDays(new Date(), 30));
  }
  if (!to) {
    to = toYMD(new Date());
  }
  console.info("fetching from getUserGrowthData");
  // await isAuthorized(["ADMIN"]);
  const d = await db
    .select({
      date: generateSqlYMDFormateDate(UserTable.createdAt),
      users: count(UserTable.id).mapWith(Number).as("users"),
    })
    .from(UserTable)
    .where(
      sql`${generateSqlYMDFormateDate(
        UserTable.createdAt
      )} BETWEEN ${from} AND ${to}`
    )
    .groupBy(generateSqlYMDFormateDate(UserTable.createdAt));
  return d;
}

export async function getRevenueData(from: string, to: string) {
  if (!from) {
    from = toYMD(subDays(new Date(), 30));
  }
  if (!to) {
    to = toYMD(new Date());
  }
  console.info("fetching from getUserGrowthData");

  // await isAuthorized(["ADMIN"]);

  const d = await db
    .select({
      date: generateSqlYMDFormateDate(PaymentTable.createdAt),
      totalRevenue: sum(PaymentTable.amount).mapWith(Number).as("totalRevenue"),
    })
    .from(PaymentTable)
    .where(
      and(
        sql`${generateSqlYMDFormateDate(
          PaymentTable.createdAt
        )} BETWEEN ${from} AND ${to}`,
        eq(PaymentTable.status, "HOLD")
      )
    )
    .groupBy(generateSqlYMDFormateDate(PaymentTable.createdAt));

  return d;
}

export async function getTaskCategoriesData(from: string, to: string) {
  if (!from) {
    from = toYMD(subDays(new Date(), 30));
  }
  if (!to) {
    to = toYMD(new Date());
  }
  const res = await db
    .select({
      date: generateSqlYMDFormateDate(TaskCategoryTable.createdAt),
      name: TaskCategoryTable.name,
      taskCount: count(TaskTable.id),
    })
    .from(TaskCategoryTable)
    .leftJoin(TaskTable, eq(TaskTable.categoryId, TaskCategoryTable.id))
    .where(
      sql`${generateSqlYMDFormateDate(
        TaskCategoryTable.createdAt
      )} BETWEEN ${from} AND ${to}`
    )
    .groupBy(TaskCategoryTable.id);

  return res;
}
