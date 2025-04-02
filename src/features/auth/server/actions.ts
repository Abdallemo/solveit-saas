"use server"
import {signIn, signOut } from "@/lib/auth"
import { loginInferedTypes } from "./auth-types"

export async function GithubSignInAction() {
    await signIn('github')
}
export async function GithubSignOutAction() {
    await signOut()
}
export async function GooogleSignInAction() {
    await signIn('google')
}
export async function EmailSignInAction({email,password}:loginInferedTypes) {
    console.log("Server Action fired with Data recieved"+email,password)
}
export async function EmailRegisterAction({email,password}:loginInferedTypes) {
    console.log("Server Action fired with Data recieved"+email,password)
    return {error:'',success:''}
}
