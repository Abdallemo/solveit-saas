import { v4 as uuid } from "uuid";
import { getVerificationTokenByEmail } from "./actions";
import db from "@/drizzle/db";
import { verificationTokens } from "@/drizzle/schemas";
import { eq } from "drizzle-orm";

export async function generateVerificationToken(email: string,) {
    const delayInMs = 15 * 60 * 1000;

    const token = uuid();
    const expires = new Date(Date.now() + delayInMs);
    console.log(expires)
    const exsistingToken = await getVerificationTokenByEmail(email)
    
    if(exsistingToken){
        await db.delete(verificationTokens).where(eq(verificationTokens.id,exsistingToken.id))

    }

    const verificationToken = await db.insert(verificationTokens).values({
        email,
        expires,
        token
    }).returning({token:verificationTokens.token})
    return verificationToken[0];

  }
  