import { env } from "@/env/server";
import { createTransporter } from "./email/createTransporter";

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
) => {
  const transporter = await createTransporter();

  const verificationUrl = `${env.NEXTAUTH_URL}/login/verify?token=${verificationToken}`;

  const mailOptions = {
    
    from: "learn3038it@gmail.com",
    to: email,
    subject: "Please verify your email address",
    text: `Click the following link to verify your email address: ${verificationUrl}`,
    html: `<p>Click the following link to verify your email address: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
