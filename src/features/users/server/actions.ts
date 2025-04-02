"use server"

import { auth,} from "@/lib/auth"



export async function getServerUserSession() {
    const session = await auth()
    if(!session?.user) return null
    return session?.user 
}