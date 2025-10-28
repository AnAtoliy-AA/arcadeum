import Constants from 'expo-constants';

function readExtra(): Record<string, unknown> {
  const expoConfig = (Constants as any)?.expoConfig;
  if (expoConfig?.extra) {
    return expoConfig.extra as Record<string, unknown>;
  }
  const manifest = (Constants as any)?.manifest;
  if (manifest?.extra) {
    return manifest.extra as Record<string, unknown>;
  }
  const manifest2 = (Constants as any)?.manifest2;
  if (manifest2?.extra) {
    return manifest2.extra as Record<string, unknown>;
  }
  return {};
}

function pickNonEmpty(...values: (string | undefined | null)[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return undefined;
}

export function getAppName(defaultName = 'Arcadeum'): string {
  const extra = readExtra();
  const fromExtra = pickNonEmpty(typeof extra.APP_NAME === 'string' ? extra.APP_NAME : undefined);
  const fromExpoConfig = pickNonEmpty((Constants as any)?.expoConfig?.name);
  let fromEnv: string | undefined;
  if (typeof process !== 'undefined' && process.env) {
    fromEnv = pickNonEmpty(process.env.EXPO_PUBLIC_APP_NAME, process.env.APP_NAME);
  }
  const fromManifest = pickNonEmpty((Constants as any)?.manifest?.name, (Constants as any)?.manifest2?.name);

  return pickNonEmpty(fromExtra, fromEnv, fromExpoConfig, fromManifest, defaultName) ?? defaultName;
}
