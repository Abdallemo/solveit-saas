"use server";

import db, {  } from "@/drizzle/db";
import { users } from "@/drizzle/schemas";
import { registerInferedTypes } from "@/features/auth/server/auth-types";
import { eq } from "drizzle-orm";

//* User Types

type UserUpdateData = Partial<typeof users.$inferInsert>;

//*End

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

type UpdateById = {
  id: string;
  email?: never;
  data: UserUpdateData;
};

type UpdateByEmail = {
  email: string;
  id?: never;
  data: UserUpdateData;
};

type UpdateUserParams = UpdateById | UpdateByEmail;

export async function UpdateUserField(parms: UpdateUserParams) {
  try {
    if (parms.email) {
      await db
        .update(users)
        .set(parms.data)
        .where(eq(users.email, parms.email));
      return;
    }
    if (parms.id) {
      await db.update(users).set(parms.data).where(eq(users.id, parms.id));
      return;
    }
  } catch (error) {
    console.log(error);
  }
}



// export async function DeleteUserField(id:string , email:string,field:Schemas) {
//   field.
//   try {
//     if (parms.email) {
//       await db.delete(field).where(eq())
//       return;
//     }
//     if (parms.id) {
//       await db.update(users).set(parms.data).where(eq(users.id, parms.id));
//       return;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }
// DeleteUserField("dsdssd",'dssdsdsd',)