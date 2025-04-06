"use server";
import { auth, signIn, signOut } from "@/lib/auth";
import {
  loginFormSchema,
  loginInferedTypes,
  registerFormSchema,
  registerInferedTypes,
} from "./auth-types";
import bcrypt from "bcryptjs";
import { CreateUser, getUserByEmail } from "@/features/users/server/actions";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import db from "@/drizzle/db";
import { generateVerificationToken } from "./auth-uitls";
import { sendVerificationEmail } from "@/lib/nodemailer";

export async function GithubSignInAction() {
  await signIn("github");
}
export async function SignOutAction() {
  await signOut({ redirectTo: "/login" });
}
export async function GooogleSignInAction() {
  await signIn("google");
}
type EmailResponeActionType = Promise<{
  error?: string;
  success?: string;
}>;

export async function EmailSignInAction(
  values: loginInferedTypes
): EmailResponeActionType {
  const validateValues = loginFormSchema.safeParse(values);
  if (!validateValues.success) return { error: "" };

  const { email, password } = validateValues.data;

  const exsistingUser = await getUserByEmail(email);

  if (!exsistingUser || !exsistingUser.email || !exsistingUser.password) {
    return { error: "Email does not exist! " };
  }

  if (!exsistingUser?.emailVerified) {
    await generateVerificationToken(exsistingUser?.email);
    const verificationToken = await getVerificationTokenByEmail(
      exsistingUser.email
    );

    if (verificationToken?.token) {
      await sendVerificationEmail(exsistingUser.email, verificationToken.token);
    }

    return { success: "Confirmation Email Send. please check your mail" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Cridentials" };

        default:
          return { error: "Something Went Wrong" };
      }
    }
    throw error;
  }

  return { error: "" };
}

export async function EmailRegisterAction(
  values: registerInferedTypes
): EmailResponeActionType {
  const { error, data } = registerFormSchema.safeParse(values);
  if (error) return { error: error.message };

  const { email, password, name } = data;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const exsistingUser = await getUserByEmail(email);
    if (exsistingUser) return { error: "Email Already in Use" };

    await CreateUser({ email, password: hashedPassword, name });
    const verificationToken = await generateVerificationToken(email);
    
    //Todo send email to the user
    await sendVerificationEmail(email, verificationToken.token!);
  } catch (error) {
    console.log(error);
    return { error: "Something Went Wrong" };
  }

  return { success: "Confirmation Email Send" };
}

//* session
export async function getServerUserSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session?.user;
}
export async function getServerSession() {
  const session = await auth();
  return session;
}

//* Auth Db Calls

export async function getVerificationTokenByEmail(email: string) {
  try {
    return await db.query.verificationTokens.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
    });
  } catch (error) {
    console.error({ verificationError: error });
    return null;
  }
}

export async function getVerificationTokenById(id: string) {
  try {
    return await db.query.verificationTokens.findFirst({
      where: (table, fn) => fn.eq(table.id, id),
    });
  } catch (error) {
    console.error({ verificationError: error });
    return null;
  }
}
