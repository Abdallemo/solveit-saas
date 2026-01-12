"use server";

import db from "@/drizzle/db";
import { publicUserColumns } from "@/features/users/server/user-types";
import { to } from "@/lib/utils/async";

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
  const [result, err] = await to(
    db.query.ProductFeedbackTable.findMany({
      limit: limit,
      offset,
      orderBy: (table, fn) => fn.desc(table.createdAt),
      with: {
        user: {
          columns: { ...publicUserColumns, role: false },
        },
      },
    }),
  );
  if (err) {
    return [];
  }
  return result;
}

export async function getContact(limit = 4, offset: number) {
  const [result, err] = await to(
    db.query.ContactTable.findMany({
      limit: limit,
      offset,
      orderBy: (table, fn) => fn.desc(table.createdAt),
    }),
  );
  if (err) {
    return [];
  }
  return result;
}
