//import 'dotenv/config';
import * as schema from '@/drizzle/schemas'
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';
import { env } from '@/env/server';

const client = postgres(env.DATABASE_URL,{max:1})

const db = drizzle(client,{schema});
export type Schemas= typeof schema
export default db;