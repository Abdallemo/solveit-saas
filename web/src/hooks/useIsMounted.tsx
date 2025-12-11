"use client";

import { useEffect, useState } from "react";

export function useIsMounted() {
  const [mounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return mounted;
}
