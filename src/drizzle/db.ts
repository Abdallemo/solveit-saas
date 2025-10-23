//import 'dotenv/config';
import * as schema from "@/drizzle/schemas";
import { env } from "@/env/server";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { drizzle, PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import postgres from "postgres";
const client = postgres(env.DATABASE_URL, { max: 1 });

const db = drizzle(client, { schema });
export type Schemas = typeof schema;
export type DBTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  Schemas,
  ExtractTablesWithRelations<Schemas>
>;
export default db;
