"use server";

import db from "@/drizzle/db";
import {
  PaymentTable,
  RefundTable,
  TaskTable,
  UserRoleType,
  UserSubscriptionTable,
  UserTable,
} from "@/drizzle/schemas";
import { isAuthorized } from "@/features/auth/server/actions";
import { registerInferedTypes } from "@/features/auth/server/auth-types";
import { count, eq, sql, sum } from "drizzle-orm";
import { UserRole } from "../../../../types/next-auth";

//* User Types

type UserUpdateData = Partial<typeof UserTable.$inferInsert>;

//*End

export async function CreateUser(values: registerInferedTypes) {
  const [user] = await db
    .insert(UserTable)
    .values(values)
    .returning({ userId: UserTable.id });
  return user;
}
export async function DeleteUserFromDb(id: string) {
  if (id) {
    db.transaction(async (tx) => {
      await tx.delete(UserTable).where(eq(UserTable.id, id));
      await tx
        .delete(UserSubscriptionTable)
        .where(eq(UserSubscriptionTable.userId, id));
    });
  }
}
export async function getUserByEmail(email: string) {
  try {
    const result = await db.query.UserTable.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
    });
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export type allUsersType = Awaited<ReturnType<typeof getAllUsers>>;

export async function getAllUsers() {
  const allUsers = await db.query.UserTable.findMany();
  return allUsers;
}
function getTrend(current: number, prev: number) {
  if (prev === 0) return 0;
  return ((current - prev) / prev) * 100;
}
export async function getSummaryStats() {
  return await db.transaction(async (tx) => {
    // ===== USERS =====
    const userResult = await tx
      .select({ role: UserTable.role, value: count() })
      .from(UserTable)
      .where(
        sql`
        ${UserTable.createdAt} >= date_trunc('month', now())
        AND ${UserTable.createdAt} < date_trunc('month', now() + interval '1 month')
      `
      )
      .groupBy(UserTable.role);

    const totalUsers = userResult.reduce((acc, r) => acc + Number(r.value), 0);
    const totalPosters =
      userResult.find((r) => r.role === "POSTER")?.value || 0;
    const totalSolvers =
      userResult.find((r) => r.role === "SOLVER")?.value || 0;
    const totalModerators =
      userResult.find((r) => r.role === "MODERATOR")?.value || 0;

    const prevUserResult = await tx
      .select({ role: UserTable.role, value: count() })
      .from(UserTable)
      .where(
        sql`
        ${UserTable.createdAt} >= date_trunc('month', now() - interval '1 month')
        AND ${UserTable.createdAt} < date_trunc('month', now())
      `
      )
      .groupBy(UserTable.role);

    const prevTotalUsers = prevUserResult.reduce(
      (acc, r) => acc + Number(r.value),
      0
    );

    // ===== TASKS =====
    const taskResult = await tx
      .select({ status: TaskTable.status, value: count() })
      .from(TaskTable)
      .where(
        sql`
        ${TaskTable.createdAt} >= date_trunc('month', now())
        AND ${TaskTable.createdAt} < date_trunc('month', now() + interval '1 month')
      `
      )
      .groupBy(TaskTable.status);

    const totalTasks = taskResult.reduce((acc, r) => acc + Number(r.value), 0);
    const activeTasks =
      taskResult.find((r) => r.status === "IN_PROGRESS")?.value || 0;
    const completedTasks =
      taskResult.find((r) => r.status === "COMPLETED")?.value || 0;

    const prevTaskResult = await tx
      .select({ status: TaskTable.status, value: count() })
      .from(TaskTable)
      .where(
        sql`
        ${TaskTable.createdAt} >= date_trunc('month', now() - interval '1 month')
        AND ${TaskTable.createdAt} < date_trunc('month', now())
      `
      )
      .groupBy(TaskTable.status);

    const prevTotalTasks = prevTaskResult.reduce(
      (acc, r) => acc + Number(r.value),
      0
    );

    // ===== DISPUTES =====
    const disputeResult = await tx
      .select({ status: RefundTable.refundStatus, value: count() })
      .from(RefundTable)
      .where(
        sql`
        ${RefundTable.createdAt} >= date_trunc('month', now())
        AND ${RefundTable.createdAt} < date_trunc('month', now() + interval '1 month')
      `
      )
      .groupBy(RefundTable.refundStatus);

    const totalDisputes = disputeResult.reduce(
      (acc, r) => acc + Number(r.value),
      0
    );
    const pendingDisputes =
      disputeResult.find((r) => r.status === "PENDING")?.value || 0;
    const resolvedDisputes = disputeResult
      .filter((r) => r.status === "REFUNDED" || r.status === "REJECTED")
      .reduce((acc, r) => acc + Number(r.value), 0);

    const prevDisputeResult = await tx
      .select({ status: RefundTable.refundStatus, value: count() })
      .from(RefundTable)
      .where(
        sql`
        ${RefundTable.createdAt} >= date_trunc('month', now() - interval '1 month')
        AND ${RefundTable.createdAt} < date_trunc('month', now())
      `
      )
      .groupBy(RefundTable.refundStatus);

    const prevTotalDisputes = prevDisputeResult.reduce(
      (acc, r) => acc + Number(r.value),
      0
    );

    // ===== REVENUE =====
    const revenueResult = await tx
      .select({
        total: sum(PaymentTable.amount).as("totalRevenue"),
        monthTotal: sum(PaymentTable.amount).as("monthlyRevenue"),
      })
      .from(PaymentTable).where(sql`
        ${PaymentTable.createdAt} >= date_trunc('month', now())
        AND ${PaymentTable.createdAt} < date_trunc('month', now() + interval '1 month')
      `);

    const monthlyRevenue = Number(revenueResult[0].monthTotal ?? 0);
    const totalRevenue = Number(revenueResult[0].total ?? 0);

    const prevRevenueResult = await tx
      .select({
        monthTotal: sum(PaymentTable.amount).as("monthlyRevenue"),
      })
      .from(PaymentTable).where(sql`
        ${PaymentTable.createdAt} >= date_trunc('month', now() - interval '1 month')
        AND ${PaymentTable.createdAt} < date_trunc('month', now())
      `);

    const prevMonthlyRevenue = Number(prevRevenueResult[0].monthTotal ?? 0);

    return {
      users: {
        total: totalUsers,
        posters: totalPosters,
        solvers: totalSolvers,
        moderators: totalModerators,
        trend: getTrend(totalUsers, prevTotalUsers),
      },
      tasks: {
        total: totalTasks,
        active: activeTasks,
        completed: completedTasks,
        trend: getTrend(totalTasks, prevTotalTasks),
      },
      disputes: {
        total: totalDisputes,
        pending: pendingDisputes,
        resolved: resolvedDisputes,
        trend: getTrend(totalDisputes, prevTotalDisputes),
      },
      revenue: {
        monthly: monthlyRevenue,
        total: totalRevenue,
        trend: getTrend(monthlyRevenue, prevMonthlyRevenue),
      },
    };
  });
}
export async function updatUserRoleByid(userId: string, role: UserRoleType) {
  await db
    .update(UserTable)
    .set({
      role,
    })
    .where(eq(UserTable.id, userId));
}
export async function getUserById(id: string) {
  try {
    const result = await db.query.UserTable.findFirst({
      where: (table, fn) => fn.eq(table.id, id),
    });
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

type UpdateById = {
  id: string;
  email?: never;
  data: UserUpdateData;
};

type UpdateByEmail = {
  email: string;
  id?: never;
  data: UserUpdateData;
};

type UpdateUserParams = UpdateById | UpdateByEmail;

export async function UpdateUserField(parms: UpdateUserParams) {
  try {
    if (parms.email) {
      await db
        .update(UserTable)
        .set(parms.data)
        .where(eq(UserTable.email, parms.email));
      return;
    }
    if (parms.id) {
      await db
        .update(UserTable)
        .set(parms.data)
        .where(eq(UserTable.id, parms.id));
      return;
    }
  } catch (error) {}
}

// export async function DeleteUserField(id:string , email:string,field:Schemas) {
//   field.
//   try {
//     if (parms.email) {
//       await db.delete(field).where(eq())
//       return;
//     }
//     if (parms.id) {
//       await db.update(users).set(parms.data).where(eq(users.id, parms.id));
//       return;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
// DeleteUserField("dsdssd",'dssdsdsd',)

export async function getServerUserRoleById({ id }: { id: string }) {}

export async function getServerUserSubscriptionById(id: string | undefined) {
  if (id === undefined) return;
  const subscription = await db.query.UserSubscriptionTable.findFirst({
    where: (table, fn) => fn.eq(table.userId, id),
  });
  if (subscription == undefined) return null;
  return subscription;
}

export async function getServerUserRoleByEmail({ email }: { email: string }) {}

export async function getServerUserSubscriptionByEmail({
  email,
}: {
  email: string;
}) {}
export async function updateUserRole(role: UserRole = "SOLVER", id: string) {
  await db.update(UserTable).set({ role: role }).where(eq(UserTable.id, id));
}
export async function isUserAccountOauth(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const user = await db.query.UserTable.findFirst({
      where: (table, fn) => fn.eq(table.id, userId),
      with: { account: true },
    });

    return !!user?.account;
  } catch (error) {
    console.error("Error checking if user is OAuth:", error);
    return false;
  }
}
export async function handleUserOnboarding() {
  const { user } = await isAuthorized(["POSTER", "SOLVER"]);
  if (!user|| user) return;
  await db.transaction(async tx=>{
    
  })
}
