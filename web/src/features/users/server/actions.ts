"use server";

import db from "@/drizzle/db";
import {
  BlogTable,
  PaymentTable,
  ProductFeedbackTable,
  RefundTable,
  TaskTable,
  UserDetails,
  UserRoleType,
  UserSubscriptionTable,
  UserTable,
} from "@/drizzle/schemas";
import { parseDrizzleQuery, Selector } from "@/drizzle/utils";
import { env } from "@/env/server";
import { isAuthorized } from "@/features/auth/server/actions";
import { registerInferedTypes } from "@/features/auth/server/auth-types";
import {
  BlogPostFormData,
  blogPostSchema,
  BlogType,
  PartialUserDetailsTableColumns,
  PartialUserTableColumns,
  publicUserColumns,
  User,
  UserDetailsTableColumns,
  UserRole,
} from "@/features/users/server/user-types";
import { withRevalidateTag } from "@/lib/cache";
import { ServiceLayerErrorType } from "@/lib/Errors";
import { logger } from "@/lib/logging/winston";
import { stripe } from "@/lib/stripe";
import { to } from "@/lib/utils/async";
import { count, eq, sql, sum } from "drizzle-orm";
import Stripe from "stripe";

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
    const [deletedAcount, error] = await to(
      db.transaction(async (tx) => {
        await tx
          .update(TaskTable)
          .set({
            solverId: null,
            assignedAt: null,
            status: "OPEN",
            updatedAt: new Date(),
          })
          .where(eq(TaskTable.solverId, id));
        await tx
          .delete(UserSubscriptionTable)
          .where(eq(UserSubscriptionTable.userId, id));
        return await tx
          .delete(UserTable)
          .where(eq(UserTable.id, id))
          .returning({ accountId: UserTable.stripeAccountId });
      }),
    );
    if (error) {
      logger.info(`deleted user ${id} from databse`);
    }
    if (
      deletedAcount &&
      deletedAcount.length > 0 &&
      deletedAcount[0].accountId
    ) {
      const [_, error] = await to(
        stripe.accounts.del(deletedAcount[0].accountId),
      );
      if (error) {
        logger.error(`failed to delete user from stripe`);
      }
    }
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
export type allModeratorsType = Awaited<ReturnType<typeof getAllModerators>>;
export type UserDbType = Exclude<
  Awaited<ReturnType<typeof getUserById>>,
  undefined | null
>;

export async function getAllUsers() {
  const allUsers = await db.query.UserTable.findMany();
  return allUsers;
}
export async function getAllModerators() {
  const moderators = await db.query.UserTable.findMany({
    with: {
      refundModerator: true,
    },
    where: (tb, fn) => fn.eq(tb.role, "MODERATOR"),
  });
  const moderatorsWithCases = moderators.map((moderator) => ({
    ...moderator,
    Cases: moderator.refundModerator.length,
    disputes: moderator.refundModerator,
  }));
  return moderatorsWithCases;
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
      `,
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
      `,
      )
      .groupBy(UserTable.role);

    const prevTotalUsers = prevUserResult.reduce(
      (acc, r) => acc + Number(r.value),
      0,
    );

    // ===== TASKS =====
    const taskResult = await tx
      .select({ status: TaskTable.status, value: count() })
      .from(TaskTable)
      .where(
        sql`
        ${TaskTable.createdAt} >= date_trunc('month', now())
        AND ${TaskTable.createdAt} < date_trunc('month', now() + interval '1 month')
      `,
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
      `,
      )
      .groupBy(TaskTable.status);

    const prevTotalTasks = prevTaskResult.reduce(
      (acc, r) => acc + Number(r.value),
      0,
    );

    // ===== DISPUTES =====
    const disputeResult = await tx
      .select({ status: RefundTable.refundStatus, value: count() })
      .from(RefundTable)
      .where(
        sql`
        ${RefundTable.createdAt} >= date_trunc('month', now())
        AND ${RefundTable.createdAt} < date_trunc('month', now() + interval '1 month')
      `,
      )
      .groupBy(RefundTable.refundStatus);

    const totalDisputes = disputeResult.reduce(
      (acc, r) => acc + Number(r.value),
      0,
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
      `,
      )
      .groupBy(RefundTable.refundStatus);

    const prevTotalDisputes = prevDisputeResult.reduce(
      (acc, r) => acc + Number(r.value),
      0,
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
export async function activeUser(userId: string, emailVerified: boolean) {
  console.log("usr to togle actiavtion with date :", emailVerified);
  await db
    .update(UserTable)
    .set({
      emailVerified: emailVerified,
    })
    .where(eq(UserTable.id, userId));
  withRevalidateTag("user-data-cache", userId);
}
export async function getUserById(id: string) {
  try {
    const result = await db.query.UserTable.findFirst({
      where: (table, fn) => fn.eq(table.id, id),
      with: { userDetails: true },
      columns: {
        ...publicUserColumns,
        stripeAccountId: true,
        stripeCustomerId: true,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function UpdateUserField(
  selector: Selector<typeof UserTable>,
  data: PartialUserTableColumns,
) {
  const { column, value } = parseDrizzleQuery(UserTable, selector);
  const updatePayload: any = { ...data };
  if (updatePayload.metadata) {
    updatePayload.metadata = sql`${UserTable.metadata} || ${JSON.stringify(
      updatePayload.metadata,
    )}::jsonb`;
  }
  const [_, error] = await to(
    db.update(UserTable).set(updatePayload).where(eq(column, value)),
  );
  if (error) {
    logger.error(
      `failed to update user table :${JSON.stringify(selector)}\t cause: ${(error as Error).cause}`,
      {
        message: (error as Error).message,
        cause: (error as Error).cause,
      },
    );
    return error;
  } else {
    logger.info(`successfully updated user ${JSON.stringify(selector)} field`);
    return null;
  }
}
export async function UpdateUserDetailField(
  selector: Selector<typeof UserDetails>,
  data: PartialUserDetailsTableColumns,
) {
  const { column, value } = parseDrizzleQuery(UserDetails, selector);
  const [_, error] = await to(
    db.update(UserDetails).set(data).where(eq(column, value)),
  );
  if (error) {
    logger.error(
      `failed to update user Details table :${JSON.stringify(selector)}\t cause: ${(error as Error).cause}`,
      {
        message: (error as Error).message,
        cause: (error as Error).cause,
      },
    );
    return error;
  } else {
    logger.info(
      `successfully updated user details ${JSON.stringify(selector)} field`,
    );
    return null;
  }
}

export async function CreateUserDetailField(values: UserDetailsTableColumns) {
  const [_, error] = await to(db.insert(UserDetails).values(values));
  if (error) {
    logger.error(
      `failed to insert into user Details  table :${(error as Error).message} \t cause: ${(error as Error).cause}`,
      {
        message: (error as Error).message,
        cause: (error as Error).cause,
      },
    );
    return error;
  } else {
    logger.info(`successfully created user details `);
    return null;
  }
}
export async function getServerUserRoleById({ id }: { id: string }) {}

export async function getServerUserSubscriptionById(id: string | undefined) {
  if (id === undefined) return;
  try {
    return await db.query.UserSubscriptionTable.findFirst({
      where: (table, fn) => fn.eq(table.userId, id),
    });
  } catch (error) {
    throw new Error("unable to find subscription");
  }
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

    return user?.account.providerId !== "credential";
  } catch (error) {
    console.error("Error checking if user is OAuth:", error);
    return false;
  }
}
export async function createStripeCustomer(user: User) {
  return await to(
    (async () => {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      await UpdateUserField(
        { id: user.id },
        { stripeCustomerId: newCustomer.id },
      );
      return newCustomer.id;
    })(),
  );
}
export async function StripeAccountUpdateHanlder(account: Stripe.Account) {
  if (account.capabilities && account.capabilities.transfers === "active") {
    const error = await UpdateUserField(
      { stripeAccountId: account.id },
      { metadata: { stripeAccountLinked: true } },
    );
    logger.info("stripe account is linked");
  }
}

export async function deleteInactiveStripeAccounts() {
  await isAuthorized(["ADMIN"]);
  if (!env.STRIPE_TEST_MODE) {
    console.log("Test Mode is Disabled! returning...");
    return;
  }
  console.log("Fetching accounts...");
  const accounts = await stripe.accounts.list({ limit: 100 });

  console.log(`Found ${accounts.data.length} total accounts.`);

  for (const account of accounts.data) {
    const transferStatus = account.capabilities?.transfers;

    const isActive = transferStatus === "active";

    if (!isActive) {
      try {
        await stripe.accounts.del(account.id);
        console.log(
          `🗑️  Deleted ${account.id} (Card Status: ${transferStatus})`,
        );
      } catch (e: any) {
        console.error(`Error deleting ${account.id}:`, e.message);
      }
    } else {
      console.log(`Keeping ${account.id} (Active)`);
    }
  }

  console.log("\nCleanup completed!");
}

export async function PublishBlogs(
  data: BlogPostFormData,
): ServiceLayerErrorType {
  const { user } = await isAuthorized(["ADMIN", "MODERATOR"]);
  const { success, data: parsedData } = blogPostSchema.safeParse(data);
  if (!success) {
    return { error: "all fields are required" };
  }
  const [_, err] = await to(
    db.insert(BlogTable).values({
      author: user.id,
      ...parsedData,
      url: parsedData.slug,
      description: parsedData.excerpt,
    }),
  );
  if (err) {
    return { error: "failed to publish! try again" };
  }
  return {
    error: null,
  };
}
export async function getAllOwnerBlog() {
  const { user } = await isAuthorized(["ADMIN", "MODERATOR"]);
  const [blogs, error] = await to(
    db.query.BlogTable.findMany({
      where: (tb, fn) => fn.eq(tb.author, user.id),
      with: {
        blogAuthor: {
          columns: publicUserColumns,
        },
      },
    }),
  );
  if (error) {
    return [];
  }
  return blogs;
}
export async function deleteBlogByID(id: string): ServiceLayerErrorType {
  if (!id) {
    return { error: "No such Blog to Delete" };
  }

  const [_, err] = await to(db.delete(BlogTable).where(eq(BlogTable.id, id)));
  if (err != null) {
    return { error: "Failed To Delete! try again" };
  }
  return { error: null };
}
export async function getBlogBySlug(url: string) {
  const [blog, error] = await to(
    db.query.BlogTable.findFirst({
      where: (tb, fn) => fn.eq(tb.url, url),
      with: {
        blogAuthor: {
          columns: publicUserColumns,
        },
      },
    }),
  );
  if (error || !blog) {
    return null;
  }
  return blog;
}
export async function getAllBlogs() {
  const [blogs, error] = await to(
    db.query.BlogTable.findMany({
      orderBy: (tb, fn) => fn.desc(tb.publishedAt),
      with: {
        blogAuthor: {
          columns: publicUserColumns,
        },
      },
    }),
  );
  if (error || !blogs) {
    return [];
  }
  return blogs;
}
