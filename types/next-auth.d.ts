import "next-auth";
import { type DefaultSession } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";
import { UserRoleType } from "@/drizzle/schemas";

type UserRole = UserRoleType;

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}
