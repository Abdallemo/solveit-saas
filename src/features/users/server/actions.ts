"use server";

import { UserTable, UserSubscriptionTable, UserRoleType } from "@/drizzle/schemas";
import { registerInferedTypes } from "@/features/auth/server/auth-types";
import { eq } from "drizzle-orm";
import { UserRole } from "../../../../types/next-auth";
import { getServerUserSession } from "@/features/auth/server/actions";
import db from "@/drizzle/db";

//* User Types

type UserUpdateData = Partial<typeof UserTable.$inferInsert>;

//*End

export async function CreateUser(values: registerInferedTypes) {
  const [user] = await db
    .insert(UserTable)
    .values(values)
    .returning({ userId: UserTable.id });
  return user;
}
export async function DeleteUserFromDb(id: string) {
  if (id) {
    db.transaction(async (tx)=>{
      await tx.delete(UserTable).where(eq(UserTable.id, id));
      await tx
        .delete(UserSubscriptionTable)
        .where(eq(UserSubscriptionTable.userId, id));

    })
  }
}
export async function getUserByEmail(email: string) {
  try {
    const result = await db.query.UserTable.findFirst({
      where: (table, fn) => fn.eq(table.email, email),
    });
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export type allUsersType = Awaited<ReturnType<typeof getAllUsers>>

export async function getAllUsers() {
  const allUsers = await db.query.UserTable.findMany();
  return allUsers;
  
}
export async function updatUserRoleByid(userId:string,role:UserRoleType) {
  await db.update(UserTable).set({
    role,
  }).where(eq(UserTable.id,userId))
  
}
export async function getUserById(id: string) {
  try {
    const result = await db.query.UserTable.findFirst({
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
        .update(UserTable)
        .set(parms.data)
        .where(eq(UserTable.email, parms.email));
      return;
    }
    if (parms.id) {
      await db.update(UserTable).set(parms.data).where(eq(UserTable.id, parms.id));
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

export async function getServerUserRoleById({ id }: { id: string }) {}

export async function getServerUserSubscriptionById(id: string | undefined) {
  if (id === undefined) return;
  const subscription = await db.query.UserSubscriptionTable.findFirst({
    where: (table, fn) => fn.eq(table.userId, id),
  });
  if (subscription == undefined) return null;
  return subscription;
}

export async function getServerUserRoleByEmail({ email }: { email: string }) {}

export async function getServerUserSubscriptionByEmail({
  email,
}: {
  email: string;
}) {}
export async function updateUserRole(role: UserRole = "SOLVER", id: string) {
  await db.update(UserTable).set({ role: role }).where(eq(UserTable.id, id));
}
