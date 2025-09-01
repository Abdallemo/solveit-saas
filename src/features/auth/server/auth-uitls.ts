import { v4 as uuid } from "uuid";
import { getVerificationTokenByEmail } from "./actions";
import db from "@/drizzle/db";
import { VerificationTokenTable } from "@/drizzle/schemas";
import { eq } from "drizzle-orm";
import type{ UserRole as userrole } from "../../../../types/next-auth";
export type UserRole = userrole
export async function generateVerificationToken(email: string,) {
    const delayInMs = 15 * 60 * 1000;

    const token = uuid();
    const expires = new Date(Date.now() + delayInMs);
    console.log(expires)
    const exsistingToken = await getVerificationTokenByEmail(email)
    
    if(exsistingToken){
        await db.delete(VerificationTokenTable).where(eq(VerificationTokenTable.id,exsistingToken.id))

    }

    const verificationToken = await db.insert(VerificationTokenTable).values({
        email,
        expires,
        token
    }).returning({token:VerificationTokenTable.token})
    return verificationToken[0];

  }
  