"use client";

import { createContext, useContext } from "react";

export type FeatureFlags = {
  monacoEditor: boolean;
  experimental3DViewer: boolean;
  aiSummarizer: boolean;
  pdfPreview: boolean;
};

const FeatureFlagContext = createContext<FeatureFlags | undefined>(undefined);

export function FeatureFlagProvider({
  flags,
  children,
}: {
  flags: FeatureFlags;
  children: React.ReactNode;
}) {
  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within a FeatureFlagProvider");
  }
  return context;
}
