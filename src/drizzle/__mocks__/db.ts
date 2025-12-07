import { drizzle } from "drizzle-orm/postgres-js";
import { vi } from "vitest";
import * as schema from "../schemas";

// 1. MOCK ENV (Prevents crash)
vi.mock("@/env/server", () => ({
  env: {
    DATABASE_URL: "postgres://mocked:url@localhost:5432/testdb",
    STRIPE_SECRET_KEY: "mocked_key",
  },
}));

const mockedDrizzle = drizzle.mock({ schema });

const mockTransaction = vi.fn(async (cb) => cb(mockedDrizzle));

const mockUpdate = vi.fn(() => ({
  set: () => ({
    where: () => ({
      returning: vi.fn().mockResolvedValue([{ id: "task-1" }]),
    }),
  }),
}));

const mockDB = {
  ...mockedDrizzle,
  transaction: mockTransaction,
  update: mockUpdate,
};

export default mockDB;
