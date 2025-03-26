"use server"

import { auth, signIn, signOut } from "@/lib/auth"


export async function GithubSignInAction() {
    await signIn('github')
}
export async function GithubSignOutAction() {
    await signOut()
}

export async function getServerUserSession() {
    const session = await auth()
    if(!session?.user) return null
    return session?.user 
}