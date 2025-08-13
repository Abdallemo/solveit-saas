import db from "@/drizzle/db";
import { eq, SQL } from "drizzle-orm";
import { UserRole } from "../../../../types/next-auth";
import { UserTable, UserSubscriptionTable } from "@/drizzle/schemas";
import { logger } from "@/lib/logging/winston";

export async function updateUserSubscription(
  values: typeof UserSubscriptionTable.$inferInsert,
  role: UserRole,
  id: string
) {
  try {
    await db.transaction(async (dx) => {
      await dx
        .update(UserSubscriptionTable)
        .set(values)
        .where(eq(UserSubscriptionTable.userId, id));
      await dx
        .update(UserTable)
        .set({ role: role })
        .where(eq(UserTable.id, id));
    });
    logger.info(`Sucessfully Updated User ${id}'s Subscription`)
  } catch (error) {
    logger.error(
      "unable to update user subscription cause: ",
      (error as Error).message,
      {
        message: (error as Error).message,
        cause: (error as Error).cause,
      }
    );
    throw new Error("unable to update user subscription cause: ", {
      cause: error,
    });
  }
}

export async function CancelUserSubscription(
  where: SQL,
  values: typeof UserSubscriptionTable.$inferInsert,
  id?: string
) {
  await db.transaction(async (dx) => {
    await dx.update(UserSubscriptionTable).set(values).where(where);

    await dx
      .update(UserTable)
      .set({ role: "POSTER" })
      .where(eq(UserTable.id, id!));
  });
}

export async function CreateUserSubsciption(
  values: typeof UserSubscriptionTable.$inferInsert
) {
  await db.insert(UserSubscriptionTable).values(values);
}
