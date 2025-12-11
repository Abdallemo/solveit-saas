"use client";

import { debounce as lodashDebounce } from "lodash";
import { useEffect, useMemo, useRef } from "react";

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
  const latestArgsRef = useRef(autoSaveArgs);

  useEffect(() => {
    latestArgsRef.current = autoSaveArgs;
  }, [autoSaveArgs]);

  const debouncedSave = useMemo(
    () =>
      lodashDebounce(() => {
        const currentArgs = latestArgsRef.current;

        const isValidArgs = currentArgs.every(
          (arg) => arg !== undefined && arg !== null,
        );

        if (!isValidArgs) return;

        autoSaveFn(...currentArgs);
      }, delay),
    [delay, autoSaveFn],
  );

  useEffect(() => {
    if (!disabled) {
      debouncedSave();
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [autoSaveArgs, debouncedSave, disabled]);
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: any[],
) {
  const debouncedFn = useMemo(
    () => lodashDebounce(callback, delay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...dependencies],
  );

  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn;
}
