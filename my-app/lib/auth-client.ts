import { createAuthClient } from "better-auth/react"
console.log(process.env.BETTER_AUTH_URL);

export const { signIn, signUp, useSession, signOut } = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})