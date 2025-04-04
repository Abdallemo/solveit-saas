"use server";

import db from "@/drizzle/db";
import { users } from "@/drizzle/schemas";
import { registerInferedTypes } from "@/features/auth/server/auth-types";

export async function CreateUser(values: registerInferedTypes) {
  await db.insert(users).values(values);

}
export async function getUserByEmail(email: string) {
  try {
    const result = await db.query.users.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
      
    });
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function getUserById(id: string) {
  try {
    const result = await db.query.users.findFirst({
      where: (table, fn) => fn.eq(table.id, id),
    });
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}
