import 'dotenv/config';
import * as schema from '@/drizzle/schemas'
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
const db = drizzle({ client: pool ,schema:schema});

export default db;