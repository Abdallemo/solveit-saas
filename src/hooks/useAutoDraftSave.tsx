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
  
  // 1. Keep the latest args in a Ref. 
  // This allows us to read them inside the debounce without adding them 
  // to the dependency array of the effect.
  const latestArgsRef = useRef(autoSaveArgs);

  // Update ref whenever args change (cheap operation)
  useEffect(() => {
    latestArgsRef.current = autoSaveArgs;
  }, [autoSaveArgs]);

  // 2. Create the debounced function ONCE.
  const debouncedSave = useMemo(
    () =>
      lodashDebounce(() => {
        const currentArgs = latestArgsRef.current;
        
        // Basic validation
        const isValidArgs = currentArgs.every(
          (arg) => arg !== undefined && arg !== null
        );

        if (!isValidArgs) return;

        // Call the server action with the current Ref values
        autoSaveFn(...currentArgs);
      }, delay),
    [delay, autoSaveFn]
  );

  // 3. Trigger the debounce when args change
  // We still watch autoSaveArgs to know *when* to trigger, 
  // but the heavy lifting is disconnected.
  useEffect(() => {
    if (!disabled) {
      debouncedSave();
    }
    
    // Cleanup on unmount
    return () => {
      debouncedSave.cancel();
    };
  }, [autoSaveArgs, debouncedSave, disabled]);
}