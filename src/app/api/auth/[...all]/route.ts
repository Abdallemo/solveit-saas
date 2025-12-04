// import { handlers } from "@/lib/auth"
// export const { GET, POST } = handlers

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
