"use server";

import db from "@/drizzle/db";
import {
  ContactTable,
  ProductFeedbackTable,
  ProductFeedbackType,
  supportPriorityType,
  SupportRequestsTable,
} from "@/drizzle/schemas";
import { to } from "@/lib/utils/async";

import { isAuthorized } from "@/features/auth/server/actions";
import { ServiceLayerErrorType } from "@/lib/Errors";
import {
  SupportFormValues,
  FeedbackFormValues,
  ContactFormValues,
  contactSchema,
} from "./types";
import { logger } from "@/lib/logging/winston";
import z from "zod";

export async function createProductFeedback(
  data: FeedbackFormValues,
): ServiceLayerErrorType {
  const { user } = await isAuthorized(["POSTER", "SOLVER"]);
  const [_, err] = await to(
    db.insert(ProductFeedbackTable).values({
      content: data.description,
      subject: data.title,
      type: data.type as ProductFeedbackType,
      userId: user.id,
    }),
  );
  if (err) {
    logger.error("Failed to Create Feedback, Error ", err.cause);
    return { error: "Something went Wrong! Try again" };
  }
  return { error: null };
}

export async function createContact(
  data: ContactFormValues,
): ServiceLayerErrorType {
  const result = contactSchema.safeParse(data);
  if (!result.success) {
    return { error: "All fields are required" };
  }
  const [_, err] = await to(
    db.insert(ContactTable).values({
      ...data,
    }),
  );
  if (err) {
    logger.error("Failed to Create Feedback, Error ", err.cause);
    return { error: "Something went Wrong! Try again" };
  }
  return { error: null };
}
export async function createSupportRequest(
  data: SupportFormValues,
): ServiceLayerErrorType {
  const { user } = await isAuthorized(["POSTER", "SOLVER"]);
  const [_, err] = await to(
    db.insert(SupportRequestsTable).values({
      description: data.description,
      subject: data.subject,
      userId: user.id,
      category: data.category,
      priority: data.priority as supportPriorityType,
    }),
  );
  if (err) {
    console.error(err);
    return { error: "Something went Wrong! Try again" };
  }
  return { error: null };
}
