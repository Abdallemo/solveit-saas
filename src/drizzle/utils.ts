import { sql, SQL } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";

export function pgFormatDateYMD<
  T extends AnyPgColumn & { dataType: "date" | "timestamp" }
>(column: T): SQL<string> {
  return sql<string>`to_char(${column}, 'YYYY-MM-DD')`;
}

export function pgFormatDateExpr(expr: SQL): SQL<string> {
  return sql<string>`to_char(${expr}::date, 'YYYY-MM-DD')`;
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
export function pgCountWithFilter<
  T extends AnyPgColumn,
  V extends T["_"]["data"] 
>(column: T, value: V): SQL<number> {
  return sql<number>`COUNT(*) FILTER (WHERE ${column} = ${value})`;
}
export function pgWithFilter<
  T extends AnyPgColumn,
  V extends T["_"]["data"] 
>(column: T, value: V): SQL<boolean> {
  return sql<boolean>`FILTER (WHERE ${column} = ${value})`;
}

// export function pgGenerateSeries(range: string): SQL {
//   return sql`
//     generate_series(
//       (current_date - interval ${sql.raw(`'${range}'`)})::date,
//       current_date::date,
//       interval '1 day'
//     ) as d
//   `;
// }


export function pgGenerateSeries(range: string) {
  const table = sql`
    generate_series(
      (current_date - interval ${sql.raw(`'${range}'`)})::date,
      current_date::date,
      interval '1 day'
    ) as days(date)
  `;

  return {
    days:table,
    date: sql<string>`days.date`,
  };
}
