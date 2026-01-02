"use server";
import db from "@/drizzle/db";
import { notifications } from "@/drizzle/schemas";
import { createTransporter } from "@/lib/email/createTransporter";
import { generateSystemEmailTemplate } from "@/lib/email/templates/basicSystem";
import { goApiClient } from "@/lib/go-api/server";
import { logger } from "@/lib/logging/winston";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
type emailBodyType = { content: string; subject: string };
type systemBodyType = { content: string; subject: string };
const DEFAULT_SUBJECT = "SolveIt Notification";

export async function getAllNotification(receiverId: string, limit = 3) {
  return await db.query.notifications.findMany({
    where: (table, fn) => fn.eq(table.receiverId, receiverId),
    limit: limit,
    orderBy: (n, { desc }) => [desc(n.createdAt)],
  });
}
type systemNotType = {
  sender?: string;
  receiverId: string;
  body: systemBodyType;
};
export async function processSystemNotification({
  body,
  receiverId,
  sender,
}: systemNotType) {
  logger.info(`in app notification send to ${receiverId}`);
  const result = await db
    .insert(notifications)
    .values({
      method: "SYSTEM",
      content: body.content,
      subject: body.subject,
      receiverId: receiverId!,
      senderId: sender!,
      read: false,
    })
    .returning();

  await goApiClient.request("/send-notification", {
    method: "POST",
    body: JSON.stringify(result[0]),
  });
  return;
}
type emaiProps = {
  sender?: string;
  body: emailBodyType;
  receiverEmail: string;
};
export async function sendNotificationByEmail({
  body,
  receiverEmail,
  sender,
}: emaiProps) {
  logger.info(`Email notification send to ${receiverEmail}`);

  const transporter = await createTransporter();

  const mailOptions = {
    from: `SolveIt Team  <solveit@org.com>`,
    to: receiverEmail,
    subject: body.subject,
    html: generateSystemEmailTemplate(body.subject, body.content),
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    logger.info("Email sent to: " + receiverEmail);
    return result;
  } catch (error) {
    logger.error(
      "Failed to send notification email. to:" +
        receiverEmail +
        `cause :${(error as Error).message}`,
      {
        error: error,
      },
    );
  }
}

export async function deleteNotification({
  id,
  receiverId,
}: {
  id: string;
  receiverId: string;
}) {
  try {
    await db
      .delete(notifications)
      .where(
        and(eq(notifications.id, id), eq(notifications.receiverId, receiverId)),
      );
    revalidatePath("/dashboard");
  } catch (error) {
    logger.error("failed to delete notification", { id: id });
    throw new Error("failed to delete notification");
  }
}
export async function notificationReadUpdate({
  id,
  receiverId,
  read,
}: {
  id: string;
  receiverId: string;
  read: boolean;
}) {
  try {
    await db
      .update(notifications)
      .set({ read: read })
      .where(
        and(eq(notifications.id, id), eq(notifications.receiverId, receiverId)),
      );
    revalidatePath("/dashboard");
    return read;
  } catch (error) {
    logger.error("failed to mark as read ", { id: id });
    throw new Error("failed to mark as read ");
  }
}
export async function markAllAsRead({ receiverId }: { receiverId: string }) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.receiverId, receiverId));
  revalidatePath("/dashboard");
}
