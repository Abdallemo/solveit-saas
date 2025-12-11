import { env } from "@/env/server";
import nodemailer from "nodemailer";

export const createTransporter = async () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.GMAIL_APP_EMAIL,
      pass: env.GMAIL_APP_PASSWORD,
    },
  });
};
