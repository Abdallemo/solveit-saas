"use server";

import db from "@/drizzle/db";
import { RulesTable } from "@/drizzle/schemas";
import { logger } from "@/lib/logging/winston";
import { revalidatePath } from "next/cache";

export async function addNewRule(values: {
  rule: string;
  description: string;
  adminId: string;
  isActive: boolean;
}) {
  const { rule, adminId, description,isActive } = values;

  if (!rule || !adminId || !description) {
    throw new Error("All fields are required");
  }
  try {
    await db.insert(RulesTable).values({
      rule,
      description,
      adminId,
      isActive
    });
    revalidatePath("/dashboard/admin/ai")
    logger.info("Successfully added new Ai Rule By " + adminId);
  } catch (error) {
    logger.error("Unable to add new Rule by " + adminId, {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("Unable to add new Rule ", { cause: error });
  }
}
export type AiRule = Awaited<ReturnType<typeof getAllAiRules>>[number];
export async function getAllAiRules() {
  return await db.query.RulesTable.findMany();
}
