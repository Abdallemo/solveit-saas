"use server";
import db from "@/drizzle/db";
import { CreateUserSubsciption } from "@/features/subscriptions/server/action";
import {
  CreateUser,
  DeleteUserFromDb,
  getUserByEmail,
  getUserById,
  UpdateUserField,
} from "@/features/users/server/actions";
import { getUserByIdCached } from "@/features/users/server/db";
import { auth, signIn, signOut } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/nodemailer";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "../../../../types/next-auth";
import {
  loginFormSchema,
  loginInferedTypes,
  registerFormSchema,
  registerInferedTypes,
} from "./auth-types";
import { generateVerificationToken } from "./auth-uitls";
// import { verificationTokens } from "@/drizzle/schemas";
// import { eq } from "drizzle-orm";

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

  try {
    const exsistingUser = await getUserByEmail(email);

    if (!exsistingUser || !exsistingUser.email || !exsistingUser.password) {
      return { error: "Email does not exist! " };
    }
    const passwordMacth = await bcrypt.compare(
      password,
      exsistingUser?.password!
    );

    if (!passwordMacth) {
      return { error: "Incorrect Password " };
    }

    if (!exsistingUser?.emailVerified) {
      await generateVerificationToken(exsistingUser?.email);
      const verificationToken = await getVerificationTokenByEmail(
        exsistingUser.email
      );

      if (verificationToken?.token) {
        await sendVerificationEmail(
          exsistingUser.email,
          verificationToken.token
        );
        return { success: "Confirmation Email Send. please check your mail" };
      }
    }
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

  return { success: "OK" };
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

    const { userId } = await CreateUser({
      email,
      password: hashedPassword,
      name,
    });
    await CreateUserSubsciption({ tier: "POSTER", userId: userId });

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
export async function userRoleSession() {
  const r = await getServerSession();
  const role = r?.user.role;
  return role;
}

//* Auth Db Calls

export async function getVerificationTokenByEmail(email: string) {
  try {
    return await db.query.VerificationTokenTable.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
    });
  } catch (error) {
    console.error({ verificationError: error });
    return null;
  }
}

export async function getVerificationTokenById(id: string) {
  try {
    return await db.query.VerificationTokenTable.findFirst({
      where: (table, fn) => fn.eq(table.id, id),
    });
  } catch (error) {
    console.error({ verificationError: error });
    return null;
  }
}

type verificationTokenReturn =
  | {
      error?: "EXPIRED" | "INVALID";
      success?: "VERIFIED";
    }
  | undefined;

export async function verifyVerificationToken(
  token: string
): Promise<verificationTokenReturn> {
  const exsistingToken = await db.query.VerificationTokenTable.findFirst({
    where: (table, fn) => fn.eq(table.token, token),
  });

  const currentDate = new Date(Date.now());

  if (!exsistingToken || !exsistingToken.token) {
    return { error: "INVALID" };
  }

  if (currentDate > exsistingToken?.expires) {
    console.log(`time comparism:  ${currentDate} > ${exsistingToken}`);
    return { error: "EXPIRED" };
  }
  if (exsistingToken.email) {
    await UpdateUserField({
      email: exsistingToken.email!,
      data: { emailVerified: currentDate },
    });
    // await db
    //   .delete(verificationTokens)
    //   .where(eq(verificationTokens.email, exsistingToken.email!));
    return { success: "VERIFIED" };
  }
}

export async function isAuthorized(whichRole: UserRole[] | undefined) {
  const user = await getServerUserSession();
  if (!whichRole) return { authorized: false, user: null };
  if (!user || !user?.role || !user.id)
    return redirect("/api/auth/signout?callbackUrl=/login");
  const userDb = await getUserByIdCached(user.id);
  if (!userDb)
    return redirect(
      "/api/auth/signout?callbackUrl=/login?error=account_deleted"
    );

  if (!whichRole.includes(user.role)) {
    redirect("/dashboard/");
  }
  return { authorized: true, user: userDb };
}

export async function DeleteUserAccount() {
  console.log("delete trigered");
  const user = await getServerUserSession();

  if (!user || !user.id) return;

  const existingUser = await getUserById(user.id);

  if (!existingUser || !existingUser.id) return;

  await DeleteUserFromDb(user.id);
  revalidateTag(`user-${user.id}`);
  await signOut();
}
