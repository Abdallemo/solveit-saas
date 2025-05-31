import db from "@/drizzle/db";
import { eq, SQL } from "drizzle-orm";
import { UserRole } from "../../../../types/next-auth";
import {  UserTable, UserSubscriptionTable } from "@/drizzle/schemas";

export async function updateUserSubscription(
  values: typeof UserSubscriptionTable.$inferInsert,
  role: UserRole = "SOLVER",
  id: string
) {
  await db.transaction(async (dx) => {
    await dx
      .update(UserSubscriptionTable)
      .set(values)
      .where(eq(UserSubscriptionTable.userId, id));
    await dx.update(UserTable).set({ role: role }).where(eq(UserTable.id, id));
  });
}

export async function CancelUserSubscription(
  where: SQL,
  values: typeof UserSubscriptionTable.$inferInsert,
  id?: string
) {
  await db.transaction(async (dx) => {
    await dx.update(UserSubscriptionTable).set(values).where(where);

    await dx.update(UserTable).set({ role: "POSTER" }).where(eq(UserTable.id, id!));
  });
}

export async function CreateUserSubsciption(
  values: typeof UserSubscriptionTable.$inferInsert
) {
  await db.insert(UserSubscriptionTable).values(values);
}