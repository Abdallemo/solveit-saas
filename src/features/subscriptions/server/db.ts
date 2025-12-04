import db from "@/drizzle/db";
import { UserSubscriptionTable, UserTable } from "@/drizzle/schemas";
import { UserRole } from "@/features/users/server/user-types";
import { logger } from "@/lib/logging/winston";
import { eq, isNotNull, SQL } from "drizzle-orm";

export async function updateUserSubscription(
  values: typeof UserSubscriptionTable.$inferInsert,
  role: UserRole,
  id: string,
  stripeCustomerId: string,
) {
  try {
    await db.transaction(async (dx) => {
      await dx
        .update(UserSubscriptionTable)
        .set(values)
        .where(eq(UserSubscriptionTable.userId, id))
        .returning();
      await dx
        .update(UserTable)
        .set({ role: role, stripeCustomerId: stripeCustomerId })
        .where(eq(UserTable.id, id));
    });

    logger.info(`Sucessfully Updated User ${id}'s Subscription`);
  } catch (error) {
    logger.error(
      "unable to update user subscription cause: ",
      (error as Error).message,
      {
        message: (error as Error).message,
        cause: (error as Error).cause,
      },
    );
    throw new Error("unable to update user subscription cause: ", {
      cause: error,
    });
  }
}

export async function CancelUserSubscription(
  where: SQL,
  values: typeof UserSubscriptionTable.$inferInsert,
  id?: string,
) {
  await db.transaction(async (dx) => {
    await dx.update(UserSubscriptionTable).set(values).where(where);

    await dx
      .update(UserTable)
      .set({ role: "POSTER", stripeCustomerId: null })
      .where(eq(UserTable.id, id!));
  });
}

export async function CreateUserSubsciption(
  values: typeof UserSubscriptionTable.$inferInsert,
) {
  await db.insert(UserSubscriptionTable).values(values);
}
export type Subscription = Awaited<
  ReturnType<typeof getAllSubscriptions>
>[number];
export async function getAllSubscriptions() {
  return await db
    .select({
      id: UserSubscriptionTable.id,
      customerId: UserTable.stripeCustomerId,
      customerName: UserTable.name,
      customerEmail: UserTable.email,
      planName: UserSubscriptionTable.tier,
      status: UserSubscriptionTable.status,
      amount: UserSubscriptionTable.price,
      interval: UserSubscriptionTable.interval,
      nextBilling: UserSubscriptionTable.nextBilling,
    })
    .from(UserSubscriptionTable)
    .leftJoin(UserTable, eq(UserSubscriptionTable.userId, UserTable.id))
    .where(isNotNull(UserSubscriptionTable.stripeSubscriptionId));
}
