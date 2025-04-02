import { z } from "zod";


//* Zod Validation Settings
export const loginFormSchema = z.object({
  email: z.string().email().min(4, {
    message: " must be a Valid Email",
  }),
   password: z.string().min(4, {
     message: "password must be at least 4 characters.",
   }),
})
export type loginInferedTypes = z.infer<typeof loginFormSchema>


export const registerFormSchema = z.object({
  name: z.string().min(4, {
    message: " name must be at least 4 characters.",
  }),
  email: z.string().email().min(4, {
    message: " must be a Valid Email",
  }),
   password: z.string().min(4, {
     message: "password must be at least 4 characters.",
   }),
})
//* Zod Types
export type registerInferedTypes = z.infer<typeof registerFormSchema>


//TODO Drizzle Schema Auth Related Related