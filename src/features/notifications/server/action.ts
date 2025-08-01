"use server";
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
              <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 20px 0;">
                        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; text-align: center;">
                                    <div style="display: inline-flex; align-items: center; gap: 8px; color: white; font-size: 24px; font-weight: bold;">
                                        <span style="font-size: 28px;">👨‍💻</span>
                                        SolveIt Team
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h1 style="color: #2d3748; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.3;">
                                        ${subject}
                                    </h1>
                                    
                                    <div style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                                        ${content}
                                    </div>
                                    
                                    <div style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 32px 0;"></div>
                                    
                                    <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 16px 20px; border-radius: 0 8px 8px 0;">
                                        <p style="margin: 0; font-size: 14px; color: #718096; font-style: italic;">
                                            <strong style="color: #4a5568;">Sent by:</strong> ${sender}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #6c757d;">
                                        This email was sent by the SolveIt Team
                                    </p>
                                    <div style="margin-top: 16px;">
                                        <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none; font-size: 12px;">Privacy Policy</a>
                                        <span style="color: #dee2e6;">|</span>
                                        <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none; font-size: 12px;">Contact Us</a>
                                        <span style="color: #dee2e6;">|</span>
                                        <a href="#" style="display: inline-block; margin: 0 8px; color: #667eea; text-decoration: none; font-size: 12px;">Unsubscribe</a>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    
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
