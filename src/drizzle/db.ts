// db.ts
import * as schema from '@/drizzle/schemas'
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';
import { env } from '@/env/server';

const globalForDb = global as unknown as {
  client?: ReturnType<typeof postgres>;
  db?: ReturnType<typeof drizzle>;
};

// Reuse client/db if already created (avoids new pools on hot reload)
export const client =
  globalForDb.client ??
  postgres(env.DATABASE_URL, { max: 1 });

export const db =
  globalForDb.db ??
  drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
  globalForDb.db = db;
}

export type Schemas = typeof schema;
export default db;
