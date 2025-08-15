"server-only";

import { env } from "@/env/server";

export const GoHeaders = {
  Authorization: `Bearer ${env.GO_API_AUTH}`,
};
