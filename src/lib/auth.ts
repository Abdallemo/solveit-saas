import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import {  accounts, sessions, users, } from "@/drizzle/schemas"
import { env } from "@/env/server"
import db from "@/drizzle/db"
 
export const { handlers, auth ,signIn,signOut  } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    // verificationTokensTable: verificationTokens,
  }),
  providers: [
    GitHub({clientId:env.AUTH_GITHUB_ID,clientSecret:env.AUTH_GITHUB_SECRET})
  ],
})