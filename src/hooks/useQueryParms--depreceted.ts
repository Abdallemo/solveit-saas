"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

let sharedParams: URLSearchParams | null = null;
const subscribers = new Set<() => void>();

function notifyAll() {
  for (const fn of subscribers) fn();
}


export default function useQueryParam<T>(key: string, def: T) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (typeof window !== "undefined" && !sharedParams) {
    sharedParams = new URLSearchParams(window.location.search);
  }

  const parser = useMemo(
    () => ({
      parse: (val: string | null, defVal: T): T => {
        if (val == null) return defVal;
        if (typeof defVal === "number") return Number(val) as T;
        if (typeof defVal === "boolean") return (val === "true") as T;
        return val as T;
      },
      serialize: (val: T) => String(val),
    }),
    []
  );

  const [state, setState] = useState<T>(() =>
    parser.parse(sharedParams?.get(key) ?? searchParams.get(key), def)
  );

  useEffect(() => {
    const fn = () => {
      if (!sharedParams) return;
      setState(parser.parse(sharedParams.get(key), def));
    };
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }, [key, def, parser]);

  useEffect(() => {
    if (!sharedParams) return;
    const updated = new URLSearchParams(searchParams.toString());
    sharedParams = updated;
    setState(parser.parse(updated.get(key), def));
  }, [searchParams, key, def, parser]);

  const setValue = useCallback(
    (val: T) => {
      if (typeof window === "undefined") return;
      if (!sharedParams)
        sharedParams = new URLSearchParams(window.location.search);

      sharedParams.set(key, parser.serialize(val));
      router.replace(`?${sharedParams.toString()}`);
      notifyAll();
    },
    [key, parser, router]
  );

  return [state, setValue] as const;
}
