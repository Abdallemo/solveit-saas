import db from "@/drizzle/db";
import { eq, SQL } from "drizzle-orm";
import { UserRole } from "../../../../types/next-auth";
import {  users, UserSubscriptionTable } from "@/drizzle/schemas";

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
    await dx.update(users).set({ role: role }).where(eq(users.id, id));
  });
}

export async function CancelUserSubscription(
  where: SQL,
  values: typeof UserSubscriptionTable.$inferInsert,
  id?: string
) {
  await db.transaction(async (dx) => {
    await dx.update(UserSubscriptionTable).set(values).where(where);

    await dx.update(users).set({ role: "POSTER" }).where(eq(users.id, id!));
  });
}

export async function CreateUserSubsciption(
  values: typeof UserSubscriptionTable.$inferInsert
) {
  await db.insert(UserSubscriptionTable).values(values);
}