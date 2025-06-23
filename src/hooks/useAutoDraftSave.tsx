"use client";

import { useEffect, useRef } from "react";
import { debounce as lodashDebounce } from "lodash";

type UseAutoSaveProps<T extends any[]> = {
  autoSaveFn: (...args: T) => void | Promise<void>;
  autoSaveArgs: T;
  delay?: number;
};

export function useAutoSave<T extends any[]>({
  autoSaveFn,
  autoSaveArgs,
  delay = 2000,
}: UseAutoSaveProps<T>) {
  const debouncedAutoSave = useRef(
    lodashDebounce((...args: T) => {
      autoSaveFn(...args);
    }, delay)
  ).current;

  useEffect(() => {
    const isValidArgs = autoSaveArgs.every(
      (arg) => arg !== undefined && arg !== null
    );

    if (!isValidArgs) return;

    debouncedAutoSave(...autoSaveArgs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...autoSaveArgs, debouncedAutoSave]);

  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);
}
