import NextAuth from "next-auth";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, UserRoleType, users } from "@/drizzle/schemas";
import db from "@/drizzle/db";
import authConfig from "./auth.config";
import { getUserById } from "@/features/users/server/actions";

import type {NextAuthConfig} from "next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
  }),

  session: {
    strategy: "jwt",
  },
  trustHost: true,
  ...authConfig,
  callbacks: {
    async session({ token, session }) {
      console.log({ sessiontoke: token });
      if (token.sub && session.user) {
        session.user.id = token.sub;
        
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRoleType;
        
      }
  
      return session;
    },
    async jwt({ token }) {
      console.log({ tokenpart: token });
      if (!token.sub) return token;

      const user = await getUserById(token.sub);

      if (!user) return token;

    token.role = user.role;
    

      return {token};
    },
  },
} satisfies NextAuthConfig

);
