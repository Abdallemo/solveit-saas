"use server";
import db from "@/drizzle/db";
import { UserSubscriptionTable, UserTable } from "@/drizzle/schemas";
import { eq, isNotNull } from "drizzle-orm";
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
