"use server";

import db from "@/drizzle/db";
import { publicUserColumns } from "@/features/users/server/user-types";

export async function getSupportRequest(limit = 4, offset: number) {
  return await db.query.SupportRequestsTable.findMany({
    limit: 4,
    offset,
    orderBy: (table, fn) => fn.desc(table.createdAt),
    with: {
      user: {
        columns: { ...publicUserColumns, role: false },
      },
    },
  });
}
export async function getProductFeedback(limit = 4, offset: number) {
  return await db.query.ProductFeedbackTable.findMany({
    limit: 4,
    offset,
    orderBy: (table, fn) => fn.desc(table.createdAt),
    with: {
      user: {
        columns: { ...publicUserColumns, role: false },
      },
    },
  });
}
