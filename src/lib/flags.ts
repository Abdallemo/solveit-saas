export enum FeatureFlagKey {
  MonacoEditor = "monacoEditor",
  Experimental3DViewer = "experimental3DViewer",

}

export type FeatureFlags = Partial<Record<FeatureFlagKey, boolean>>;