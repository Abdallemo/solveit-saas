"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Parser<T> = {
  parse: (val: string | null, def: T) => T;
  serialize: (val: T) => string;
};
export default function useQueryParam<T>(key: string, def: T) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const parser: Parser<T> = useMemo(
    () => ({
      parse: (val, defVal) => {
        if (val == null) return defVal;
        if (typeof defVal === "number") return Number(val) as T;
        if (typeof defVal === "boolean") return (val === "true") as T;
        return val as T;
      },
      serialize: (val) => String(val),
    }),
    []
  );

  const [localState, setLocalState] = useState<T>(
    parser.parse(searchParams.get(key), def)
  );

  useEffect(() => {
    const newVal = parser.parse(searchParams.get(key), def);
    setLocalState(newVal);
  }, [searchParams, key, def, parser]);

  function setter(newValue: T) {
    setLocalState(newValue);
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, parser.serialize(newValue));
    router.replace(`?${params.toString()}`);
  }

  return [localState, setter] as const;
}
