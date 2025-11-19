"use server";

import db from "@/drizzle/db";
import { logTable } from "@/drizzle/schemas";
import { lt } from "drizzle-orm";
export type PaginatedLogs = Awaited<ReturnType<typeof getLogs>>;

export async function getLogs({
  limit = 20,
  cursor = undefined,
}: {
  limit: number;
  cursor: string | undefined;
}) {
  let whereClause = undefined;

  if (cursor) {
    const cursorDate = new Date(cursor);
    whereClause = lt(logTable.createdAt, cursorDate);
  }

  const logs = await db.query.logTable.findMany({
    where: whereClause,
    limit: limit + 1,

    orderBy: (l, { desc }) => desc(l.createdAt),
    columns: { id: true, level: true, message: true, createdAt: true },
  });

  const hasNextPage = logs.length > limit;
  const data = logs.slice(0, limit);

  const nextCursor = hasNextPage
    ? data[data.length - 1].createdAt.toISOString()
    : undefined;

  return { logs: data, nextCursor };
}
