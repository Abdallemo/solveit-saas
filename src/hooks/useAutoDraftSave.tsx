"use client";

import { debounce as lodashDebounce } from "lodash";
import { useEffect, useRef } from "react";

type UseAutoSaveProps<T extends any[], RT> = {
  autoSaveFn: (...args: T) => RT | Promise<RT>;
  autoSaveArgs: T;
  delay?: number;
  disabled?: boolean;
};

export function useAutoSave<T extends any[], RT>({
  autoSaveFn,
  autoSaveArgs,
  delay = 2000,
  disabled = false,
}: UseAutoSaveProps<T, RT>) {
  const debouncedAutoSave = useRef(
    lodashDebounce((...args: T) => {
      autoSaveFn(...args);
    }, delay)
  ).current;

  useEffect(() => {
    const isValidArgs = autoSaveArgs.every(
      (arg) => arg !== undefined && arg !== null
    );
    if (disabled) return;
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
