"use client";

import QueryParamManager from "@/lib/QueryManager";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function useQueryParam<T>(key: string, def: T) {
  const manager = useMemo(() => QueryParamManager.getInstance(), []);
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return def;
    return manager.get<T>(key, def);
  });

  useEffect(() => {
    const unsub = manager.subscribe(key, () => {
      setState(manager.get<T>(key, def));
    });
    setState(manager.get<T>(key, def));
    return unsub;
  }, [key, def, manager]);

  const setValue = useCallback(
    (val: T) => {
      if (typeof window === "undefined") return;
      manager.set<T>(key, val);
    },
    [key, manager]
  );

  return [state, setValue] as const;
}
