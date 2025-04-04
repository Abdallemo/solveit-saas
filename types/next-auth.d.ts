import "next-auth";
import { DefaultSession } from "next-auth";
import { UserRoleType } from "@/drizzle/schemas";

export type ExtendedUserSession = DefaultSession["user"] & {
  role: UserRoleType;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRoleType;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    role: UserRoleType;
  }
}
