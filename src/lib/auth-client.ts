import { env } from "@/env/client";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_URL,
  plugins: [],
  sessionOptions: {
    refetchInterval: 5 * 60,
    refetchOnWindowFocus: false,
  },
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
