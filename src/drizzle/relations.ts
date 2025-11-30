import { relations as drizzleRelations } from "drizzle-orm";

/**
 * A typed wrapper around Drizzle's `relations()` function.
 *
 * Usage guide:
 * - Use `one()` when this table holds a foreign key.
 * - Use `many()` when this table is referenced by another.
 *
 * Example:
 * ```ts
 * export const SomeTableRelations = defineRelations(SomeTable, ({ one, many }) => ({
 *   poster: one(OtherTable, {
 *     fields: [SomeTable.fild],
 *     references: [OtherTable.fild],
 *   }),
 * }));
 * ```
 */

export const relations = drizzleRelations;
