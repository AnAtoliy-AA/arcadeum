import Constants from 'expo-constants';

export interface AppExpoConfig {
  APP_NAME: string;
  APP_SLUG: string;
  APP_SCHEME: string;
  AUTH_ISSUER?: string;
  AUTH_ANDROID_CLIENT_ID?: string;
  AUTH_IOS_CLIENT_ID?: string;
  AUTH_WEB_CLIENT_ID?: string;
  AUTH_ANDROID_REDIRECT_SCHEME?: string;
  AUTH_IOS_REDIRECT_SCHEME?: string;
  AUTH_WEB_REDIRECT_URL?: string;
  API_BASE_URL?: string;
  WS_BASE_URL?: string;
  ANDROID_DEV_HOST?: string;
  androidDevHost?: string;
  SUPPORT_URL?: string;
  SUPPORT_COFFEE_URL?: string;
  SUPPORT_IBAN?: string;
  downloadLinks?: {
    ios?: string;
    android?: string;
  };
  eas?: {
    projectId: string;
  };
  router?: {
    origin: string;
  };
}

/**
 * Expo manifest2 type (not fully typed in expo-constants).
 */
interface ExpoManifest2 {
  id?: string;
  createdAt?: string;
  runtimeVersion?: string;
  launchAsset?: {
    url?: string;
    hash?: string;
  };
  assets?: Array<{
    path?: string;
    hash?: string;
    key?: string;
  }>;
  metadata?: Record<string, unknown>;
  extra?: Record<string, unknown>;
}

/**
 * Access constants from expoConfig.extra in a type-safe way.
 */
export const getAppExtra = (): AppExpoConfig => {
  return (
    (Constants.expoConfig?.extra as AppExpoConfig) ?? ({} as AppExpoConfig)
  );
};

/**
 * Get the full expoConfig in a typed way.
 */
export const getExpoConfig = () => {
  return Constants.expoConfig;
};

/**
 * Get the manifest (deprecated/older way, but still used in some places).
 */
export const getManifest = () => {
  return Constants.manifest;
};

/**
 * Get manifest2.
 */
export const getManifest2 = (): ExpoManifest2 | undefined => {
  // manifest2 is not in the official expo-constants types yet
  const constants = Constants as Record<string, unknown>;
  return constants.manifest2 as ExpoManifest2 | undefined;
};
