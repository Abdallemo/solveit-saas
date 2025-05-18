import { env } from "@/env/server";
import { createTransporter } from "./email/createTransporter";

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
) => {
  const transporter = await createTransporter();

  const verificationUrl = `${env.NEXTAUTH_URL}/login/verify?token=${verificationToken}`;

  const mailOptions = {
    from: `"SolveIt Team 👨‍💻" <learn3038it@gmail.com>`,
    to: email,
    subject: "Please verify your email address",
    text: `Click the following link to verify your email address: ${verificationUrl}`,
    html: `<div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.5;">
    <h2 style="color: #1a73e8;">Please Verify Your Email Address</h2>
    <p>Thank you for registering! Please click the button below to verify your email address:</p>
    <a href="${verificationUrl}" 
       style="
         display: inline-block;
         background-color: #1a73e8;
         color: white;
         padding: 12px 24px;
         text-decoration: none;
         border-radius: 5px;
         font-weight: bold;
         margin: 20px 0;
       ">
      Verify Email
    </a>
    <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
    <p style="word-break: break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
  </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
