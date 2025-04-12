import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function useCurrentUser() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState(session?.user);
    const [state, setState] = useState(status);

    useEffect(() => {
        setUser(session?.user);
        setState(status);
    }, [session, status]);

    return { user, state };
}