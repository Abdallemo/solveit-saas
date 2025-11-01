import { sql, SQL } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";

export function pgFormatDateYMD<
  T extends AnyPgColumn & { dataType: "date" | "timestamp" }
>(column: T): SQL<string> {
  return sql<string>`to_char(${column}, 'YYYY-MM-DD')`;
}

export function pgInterveralRange<
  T extends AnyPgColumn & { dataType: "date" | "timestamp" }
>(column: T, range: string): SQL<boolean> {
  return sql<boolean>`${column} > NOW() - interval '${sql.raw(range)}'`;
}

export function pgBetweenDates<
  T extends AnyPgColumn & { dataType: "date" | "timestamp" }
>(column: T, { from, to }: { from: string; to: string }): SQL<boolean> {
  return sql`${pgFormatDateYMD(column)} BETWEEN ${from} AND ${to}`;
}

export function pgCountWithinRange<
  T extends AnyPgColumn & { dataType: "date" | "timestamp" }
>(column: T, range: string): SQL<number> {
  return sql<number>`COUNT(*) FILTER (WHERE ${column} > NOW() - INTERVAL '${sql.raw(
    range
  )}')`;
}
