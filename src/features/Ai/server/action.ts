"use server";

import db from "@/drizzle/db";
import { RulesTable } from "@/drizzle/schemas";
import { env } from "@/env/server";
import { GoHeaders } from "@/lib/go-config";
import { logger } from "@/lib/logging/winston";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function addNewRule(values: {
  rule: string;
  description: string;
  adminId: string;
  isActive: boolean;
}) {
  const { rule, adminId, description, isActive } = values;

  if (!rule || !adminId || !description) {
    throw new Error("All fields are required");
  }
  try {
    await db.insert(RulesTable).values({
      rule,
      description,
      adminId,
      isActive,
    });
    revalidatePath("/dashboard/admin/ai");
    logger.info("Successfully added new Ai Rule By " + adminId);
  } catch (error) {
    logger.error("Unable to add new Rule by " + adminId, {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("Unable to add new Rule ", { cause: error });
  }
}
export async function updateRule(values: {
  rule: string;
  description: string;
  ruleId: string;
  adminId: string;
}) {
  const { rule, description, ruleId, adminId } = values;

  if (!rule || !ruleId || !description || !adminId) {
    throw new Error("All fields are required");
  }
  try {
    await db
      .update(RulesTable)
      .set({ description, rule })
      .where(eq(RulesTable.id, ruleId));

    revalidatePath("/dashboard/admin/ai");
    logger.info("Successfully updated Ai Rule By " + adminId);
  } catch (error) {
    logger.error("Unable to update Rule by " + adminId, {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("Unable to update Rule ", { cause: error });
  }
}
export async function toggleRuleActivation(values: {
  state: boolean;
  ruleId: string;
  adminId:string;
}) {
  const { state, adminId, ruleId } = values;
  try {
    await db
      .update(RulesTable)
      .set({ isActive: state })
      .where(eq(RulesTable.id, ruleId));

    revalidatePath("/dashboard/admin/ai");
    logger.info("Successfully updated Ai Rule Active State By " + adminId);
  } catch (error) {
    logger.error("Unable to update Rule by Active State" + adminId, {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("Unable to update Rule State", { cause: error });
  }
}

export type AiRule = Awaited<ReturnType<typeof getAllAiRules>>[number];
export async function getAllAiRules() {
  return await db.query.RulesTable.findMany({
    orderBy: (tb, ty) => ty.desc(tb.createdAt),
  });
}
const openaiResSchema = z.object({
  violatesRules: z.boolean(),
});
const autoSuggestResSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
});
export type openaiResType = z.infer<typeof openaiResSchema>;
export async function validateContentWithAi(content: string) {
  try {
    const res = await fetch(`${env.GO_API_URL}/openai?task=moderation`, {
      method: "POST",
      headers: GoHeaders,
      body: JSON.stringify({ content: content }),
    });
    if (!res.ok) {
      console.error(res.json());
      throw new Error("unable to fetch");
    }
    const data = await res.json();
    const validatedData = openaiResSchema.safeParse(data);
    if (!validatedData.success) {
      logger.error("Invalid API response schema. from go service");
      throw new Error("Invalid API response schema.");
    }
    return validatedData.data;
  } catch (error) {
    logger.error("failed to fetch goapi openai");
    throw error;
  }
}
export async function autoSuggestWithAi(fields: { content: string }) {
  try {
    const res = await fetch(`${env.GO_API_URL}/openai?task=autosuggestion`, {
      method: "POST",
      headers: GoHeaders,
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      console.error(res.json());
      throw new Error("unable to fetch");
    }
    const data = await res.json();
    const validatedData = autoSuggestResSchema.safeParse(data);
    if (!validatedData.success) {
      logger.error("Invalid API response schema. from go service");
      throw new Error("Invalid API response schema.");
    }
    return validatedData.data;
  } catch (error) {
    logger.error("failed to fetch goapi openai");
    throw error;
  }
}

export async function deleteRule(id: string) {
  try {
    await db.delete(RulesTable).where(eq(RulesTable.id, id));
  } catch (error) {
    logger.error(
      "unable to delete this rule, cause: " + (error as Error).message
    );
    throw new Error("unable to delete this rule");
  }
}
