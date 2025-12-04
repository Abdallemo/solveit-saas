import { User } from "@/features/users/server/user-types";
import { useSession } from "@/lib/auth-client";

export default function useCurrentUser() {
  const { data, isPending, error, isRefetching } = useSession();

  return {
    user: data?.user as User,
    state: isPending,
    error,
    isRefetching,
  };
}
