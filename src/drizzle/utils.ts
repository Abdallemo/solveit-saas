import { sql, SQL } from "drizzle-orm";
import { AnyPgColumn } from "drizzle-orm/pg-core";

export function generateSqlYMDFormateDate<
  T extends AnyPgColumn & { dataType: 'date' | 'timestamp' }
>(column: T): SQL<string> {
  return sql<string>`to_char(${column}, 'YYYY-MM-DD')`
}
