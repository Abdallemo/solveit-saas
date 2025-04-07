import { useSession } from "next-auth/react";

export default function useCurrentUser() {
    const session = useSession()
    if(!session) return {}
    return session.data?.user
    
}
