import { useEffect, useState } from "react";
import useCurrentUser from "./useCurrentUser";

export function useAuthGate(delay = 400) {
  const { state } = useCurrentUser();
  const [showAuthGate, setShowAuthGate] = useState(false);

  useEffect(() => {
    if (state === "unauthenticated") {
      const timer = setTimeout(() => {
        setShowAuthGate(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [state, delay]);

  const isLoading = state === "loading" || (state === "unauthenticated" && !showAuthGate);
  const isBlocked = state === "unauthenticated" && showAuthGate;

  return { isLoading, isBlocked };
}
