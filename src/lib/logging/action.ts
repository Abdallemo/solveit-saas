"use server";

import db from "@/drizzle/db";
export type LogsTyep = Awaited<ReturnType<typeof getLogs>>
export async function getLogs() {
  const logs =await db.query.logTable.findMany({
    orderBy: (l, { desc }) => desc(l.createdAt),
    columns: { id: true, level: true, message: true ,createdAt:true},
  });
  return logs
}
