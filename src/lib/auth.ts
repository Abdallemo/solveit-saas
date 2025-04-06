import NextAuth from "next-auth";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, users } from "@/drizzle/schemas";
import db from "@/drizzle/db";
import authConfig from "./auth.config";
import { getUserById, UpdateUserField } from "@/features/users/server/actions";

import type { NextAuthConfig } from "next-auth";

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
  events: {
    linkAccount({ user }) {
      UpdateUserField({ id: user.id!, data: { emailVerified: new Date() } });
    },
  },
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      const exsistingUser = await getUserById(user.id!);

      if (!exsistingUser?.emailVerified) return false;

      return true;
    },
    async session({ token, session }) {
      // console.log({ sessiontoke: token });
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      session.user.role = token.role;

      return session;
    },
    async jwt({ token }) {
      console.log({ tokenpart: token });
      if (!token.sub) return token;

      const user = await getUserById(token.sub);

      if (!user) return token;
      if (!user.role) return token;
      token.role = user.role;

      return token;
    },
  },
} satisfies NextAuthConfig);
