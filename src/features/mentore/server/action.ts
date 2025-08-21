"use server";

import db from "@/drizzle/db";
import { MentorshipProfileTable } from "@/drizzle/schemas";
import { getServerUserSession } from "@/features/auth/server/actions";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { MentorError, SubscriptionError } from "@/lib/Errors";
import { logger } from "@/lib/logging/winston";
import { eq } from "drizzle-orm";

export type AvailabilitySlot = {
  day: string;
  start: string;
  end: string;
};

export async function validateMentorAccess() {
  const user = (await getServerUserSession())!;
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  const usrSub = await getServerUserSubscriptionById(user.id);
  if (!usrSub || !usrSub.tier) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "SOLVER") {
    throw new SubscriptionError();
  }

  if (usrSub.tier !== "SOLVER++") {
    throw new MentorError();
  }

  return { user, usrSub };
}
export type MentorListType = Exclude<
  Awaited<ReturnType<typeof getMentorListig>>,
  any[]
>;
export async function getMentorListig(t: "poster" | "solver++") {
  const { user, usrSub } = await validateMentorAccess();
  if (t === "solver++") {
    const result = await db.query.MentorshipProfileTable.findFirst({
      where: (tb, fn) => fn.eq(tb.userId, user.id!),
    });
    return result;
  } else {
    const results = await db.query.MentorshipProfileTable.findMany();
    return results;
  }
}
export async function saveMentorListing(values: {
  title: string;
  avatar: string;
  description: string;
  availableTimes: AvailabilitySlot[];
  ratePerHour: number;
}) {
  const { title, description, availableTimes, ratePerHour, avatar } = values;
  try {
    const { user, usrSub } = await validateMentorAccess();
    const exsitPrf = await db.query.MentorshipProfileTable.findFirst({
      where: (tb, fn) => fn.eq(tb.userId, user.id!),
    });
    if (exsitPrf) {
      await db
        .update(MentorshipProfileTable)
        .set({
          title,
          description,
          avatar,
          availableTimes: JSON.stringify(availableTimes),
          ratePerHour: String(ratePerHour),
        })
        .where(eq(MentorshipProfileTable.id, user.id!));
      logger.info("successfully saved mentor profile ");
    } else {
      await db.insert(MentorshipProfileTable).values({
        userId: user.id!,
        title,
        description,
        avatar,

        availableTimes: JSON.stringify(availableTimes),
        ratePerHour: String(ratePerHour),
      });
      logger.info("successfully saved mentor profile ");
    }
  } catch (error) {
    logger.error("unable to save mentor listing", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
  //rest ...
}
