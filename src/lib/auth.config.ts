// import GitHub from "next-auth/providers/github";
// import Google from "next-auth/providers/google";
// import Credentials from "next-auth/providers/credentials";

// import type { NextAuthConfig } from "next-auth";
// import { env } from "@/env/server";
// import { loginFormSchema } from "@/features/auth/server/auth-types";
// import { getUserByEmail } from "@/features/users/server/actions";
// import bcrypt from "bcryptjs";

// export default {
//   providers: [
//     GitHub({
//       clientId: env.AUTH_GITHUB_ID,
//       clientSecret: env.AUTH_GITHUB_SECRET,
//     }),
//     Google({
//       clientId: env.AUTH_GOOGLE_ID,
//       clientSecret: env.AUTH_GOOGLE_SECRET,
//     }),
//     Credentials({
//       async authorize(credentials) {
//         const validatecFields = loginFormSchema.safeParse(credentials);
//         if (validatecFields.success) {
//           const { email, password } = validatecFields.data;

//           const user = await getUserByEmail(email);
//           if (!user || !user.password) return null;

//           const passwordMacth = await bcrypt.compare(password, user.password);

//           if (passwordMacth) return user;
//         }

//         return null;
//       },
//     }),
//   ],
// } satisfies NextAuthConfig;
