import { useSession } from "next-auth/react";

export default function useCurrentUser() {
    const {data,status} = useSession()
   
    return {user: data?.user,state:status}
    
}
