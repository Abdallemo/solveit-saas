import { env } from "@/env/client";
import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_URL,
  plugins: [jwtClient()],
  sessionOptions: {
    refetchInterval: 5 * 60,
    refetchOnWindowFocus: false,
  },
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
