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
export async function GithubSignInAction() {
  await signIn("github");
}
export async function GithubSignOutAction() {
  await signOut();
}
export async function GooogleSignInAction() {
  await signIn("google");
}
type EmailResponeActionType = Promise<{
  error?: string;
  success?: string;
} >;

export async function EmailSignInAction(values: loginInferedTypes): EmailResponeActionType {
  const validateValues = loginFormSchema.safeParse(values);
  if (!validateValues.success) return { error: "" };
  
  const {email,password} = validateValues.data

  
  try {

    await signIn('credentials',{email,password,redirectTo:DEFAULT_LOGIN_REDIRECT})
    
  } catch (error) {
  if(error instanceof AuthError){
      switch (error.type) {
        case 'CredentialsSignin':
          return {error:'Invalid Cridentials'}
          
        default:
          return {error:'Something Went Wrong'}


      }
    }
    throw error
  }

  return {error:'',}
}

export async function EmailRegisterAction(
  values: registerInferedTypes
): EmailResponeActionType {

  const { error, data } = registerFormSchema.safeParse(values);
  if (error) return { error: error.message };

  const { email, password, name } = data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const exsistingUser = await getUserByEmail(email)
  if(exsistingUser) return {error:'Email Already in Use'}

  await CreateUser({email,password:hashedPassword,name})

  return{success:'Email seccessfully Created '}
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

