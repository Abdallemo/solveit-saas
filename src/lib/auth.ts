import NextAuth from "next-auth"

import { DrizzleAdapter } from "@auth/drizzle-adapter"
import {  accounts, users, } from "@/drizzle/schemas"
import db from "@/drizzle/db"
import authConfig from "./auth.config"


export const { handlers, auth ,signIn,signOut  } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    
  }),
  
  session:{
    strategy:'jwt'
  },
  trustHost:true,
  ...authConfig
})