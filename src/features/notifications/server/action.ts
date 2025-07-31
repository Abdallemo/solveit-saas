"use server"
import { createTransporter } from "@/lib/email/createTransporter";
type ContentType = string | { content: string; subject: string };
const DEFAULT_SUBJECT = "SolveIt Notification";
type NotificationProp = {
  sender: string;
  receiver: string;
  body: ContentType;
};

export async function sendNotificationByEmail({
  body,
  receiver,
  sender,
}: NotificationProp) {
  const transporter = await createTransporter();

  const content = typeof body === "string" ? body : body.content;
  const subject = typeof body === "string" ? DEFAULT_SUBJECT : body.subject;

  const mailOptions = {
    from: `SolveIt Team 👨‍💻 <solveit@org.com>`,
    to: receiver,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
        <h3>${subject}</h3>
        <p>${content}</p>
        <p style="font-size: 0.9em; color: gray;">Sent by ${sender}</p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send notification email.");
  }
}

export async function sendNotification({
  sender,
  receiver,
  body,
  method = ["email", "system"],
}: NotificationProp & { method?: ("email" | "system")[] }) {
  if (method.includes("email")) {
    await sendNotificationByEmail({ sender, receiver, body });
  }
  if (method.includes("system")) {
    //todo will add in system websocket db notifcation
    console.log(
      `[SYSTEM NOTIFICATION] To: ${receiver} | Subject: ${
        typeof body === "string" ? "System Notification" : body.subject
      }`
    );
    // await saveSystemNotification({ sender, receiver, body })
  }
}
