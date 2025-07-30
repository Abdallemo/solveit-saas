"use client";

import { createContext, useContext, ReactNode } from "react";

type FeatureFlags = Record<string, boolean>;

const FeatureFlagContext = createContext<FeatureFlags | undefined>(undefined);

export const FeatureFlagProvider = <T extends FeatureFlags>({
  children,
  flags,
}: {
  children: ReactNode;
  flags: T;
}) => {
  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlagContext = <T extends FeatureFlags>() => {
  const context = useContext(FeatureFlagContext);
  if (!context) throw new Error("Must be used within FeatureFlagProvider");
  return context as T;
};
