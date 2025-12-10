"use server";

import db from "@/drizzle/db";
import {
  AiFlagsTable,
  AiTestSandboxTable,
  RulesTable,
} from "@/drizzle/schemas";
import { pgFormatDateYMD } from "@/drizzle/utils";
import { env } from "@/env/server";
import { isAuthorized } from "@/features/auth/server/actions";
import { GoHeaders } from "@/lib/go-config";
import { logger } from "@/lib/logging/winston";
import { DeleteKeysByPattern } from "@/lib/redis";
import {
  getCurrentServerTime,
  runInBackground,
  toYMD,
} from "@/lib/utils/utils";
import { subDays } from "date-fns";
import { count, eq, sql } from "drizzle-orm";
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
    runInBackground({
      promise: DeleteKeysByPattern("openai:moderation:*"),
      taskName: "Clear AI cache",
    });
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
      .set({ description, rule, updatedAt: new Date() })
      .where(eq(RulesTable.id, ruleId));

    revalidatePath("/dashboard/admin/ai");
    runInBackground({
      promise: DeleteKeysByPattern("openai:moderation:*"),
      taskName: "Clear AI cache",
    });
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
  adminId: string;
}) {
  const { state, adminId, ruleId } = values;
  try {
    await db
      .update(RulesTable)
      .set({ isActive: state, updatedAt: new Date() })
      .where(eq(RulesTable.id, ruleId));

    revalidatePath("/dashboard/admin/ai");
    runInBackground({
      promise: DeleteKeysByPattern("openai:moderation:*"),
      taskName: "Clear AI cache",
    });

    logger.info("Successfully updated Ai Rule Active State By " + adminId);
  } catch (error) {
    logger.error("Unable to update Rule by Active State" + adminId, {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw new Error("Unable to update Rule State", { cause: error });
  }
}

export type AiRule = Exclude<
  Awaited<ReturnType<typeof getAllAiRules>>,
  undefined
>[number];
export async function getAllAiRules() {
  try {
    return await db.query.RulesTable.findMany({
      orderBy: (tb, ty) => ty.desc(tb.createdAt),
    });
  } catch (error) {
    logger.error("failed to fetch");
  }
}
const autoSuggestResSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
});
const openaiResSchema = z.object({
  violatesRules: z.boolean(),
  reason: z.string(),
  triggeredRules: z.array(z.string()).default([]),
  confidenceScore: z.number(),
});
export type openaiResAdminType = z.infer<typeof openaiResSchema>;
export type openaiResUserType = Pick<openaiResAdminType, "violatesRules">;

export async function validateContentWithAi(fields: {
  content: string;
  adminMode: true;
}): Promise<openaiResAdminType>;
export async function validateContentWithAi(fields: {
  content: string;
  adminMode: false;
}): Promise<openaiResUserType>;

export async function validateContentWithAi(
  fields:
    | { content: string; adminMode: true }
    | { content: string; adminMode: false },
): Promise<openaiResAdminType | openaiResUserType> {
  try {
    const res = await fetch(`${env.GO_API_URL}/openai?task=moderation`, {
      method: "POST",
      headers: { ...GoHeaders },
      body: JSON.stringify(fields),
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
    if (fields.adminMode) {
      return validatedData.data;
    } else {
      const allowedResponse: openaiResUserType = {
        violatesRules: validatedData.data.violatesRules,
      };
      return allowedResponse;
    }
  } catch (error) {
    logger.error("failed to fetch goapi openai");
    throw error;
  }
}
export async function autoSuggestWithAi(fields: { content: string }) {
  try {
    const res = await fetch(`${env.GO_API_URL}/openai?task=autosuggestion`, {
      method: "POST",
      headers: { ...GoHeaders },
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
    runInBackground({
      promise: DeleteKeysByPattern("openai:moderation:*"),
      taskName: "Clear AI cache",
    });
  } catch (error) {
    logger.error(
      "unable to delete this rule, cause: " + (error as Error).message,
    );
    throw new Error("unable to delete this rule");
  }
}

export async function saveAdminAiSandboxTests({
  content,
  autoSave = false,
}: {
  content: string;

  autoSave?: boolean;
}) {
  try {
    const { session } = await isAuthorized(["ADMIN"]);
    const {
      user: { id: adminId },
    } = session;
    const res = await db.query.AiTestSandboxTable.findFirst({
      where: (tb, fn) => fn.eq(tb.adminId, adminId),
    });
    if (res) {
      if (autoSave) {
        await db
          .update(AiTestSandboxTable)
          .set({
            content: content,
            updatedAt: getCurrentServerTime(),
          })
          .where(eq(AiTestSandboxTable.adminId, adminId));
      } else {
        await db
          .update(AiTestSandboxTable)
          .set({
            content: content,
            updatedAt: getCurrentServerTime(),
            testAmount: res.testAmount + 1,
          })
          .where(eq(AiTestSandboxTable.adminId, adminId));
      }
    } else {
      await db.insert(AiTestSandboxTable).values({
        adminId,
        content,
      });
    }
  } catch (error) {
    console.log(error);
  }
}
export type AdminAiSandboxTestsType = Exclude<
  Awaited<ReturnType<typeof getAdminAiSandboxTests>>,
  undefined
>;
export async function getAdminAiSandboxTests() {
  const {
    session: { user },
  } = await isAuthorized(["ADMIN"]);
  return await db.query.AiTestSandboxTable.findFirst({
    where: (tb, fn) => fn.eq(tb.adminId, user.id),
  });
}

export async function getAIFlagsData(from: string, to: string) {
  if (!from) {
    from = toYMD(subDays(new Date(), 30));
  }
  if (!to) {
    to = toYMD(new Date());
  }
  const res = await db
    .select({
      date: pgFormatDateYMD(AiFlagsTable.createdAt),
      flags: count(AiFlagsTable.id),
    })
    .from(AiFlagsTable)
    .where(
      sql`${pgFormatDateYMD(AiFlagsTable.createdAt)} BETWEEN ${from} AND ${to}`,
    )
    .groupBy(pgFormatDateYMD(AiFlagsTable.createdAt));

  return res;
}
