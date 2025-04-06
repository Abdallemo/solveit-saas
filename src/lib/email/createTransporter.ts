import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import { env } from "@/env/server";

export const createTransporter = async () => {
  const oauth2Client = new OAuth2Client(
    env.AUTH_GOOGLE_ID,
    env.AUTH_GOOGLE_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: env.AUTH_GOOGLE_REFRESH_TOKEN,
  });

  const accessToken = await new Promise<string>((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err || !token) {
        reject("Failed to refresh access token");
        return;
      }
      resolve(token);
    });
  });

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "learn3038it@gmail.com",
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      refreshToken: env.AUTH_GOOGLE_REFRESH_TOKEN,
      accessToken,
    },
  });
};
