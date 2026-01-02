import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/env/server";

export default defineConfig({
  out: "../shared/schema",
  schema: "./src/drizzle/schemas.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  migrations: {
    table: "__drizzle_migrations",
    schema: "public",
  },
});
