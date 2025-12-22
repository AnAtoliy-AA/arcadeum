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
export const getManifest2 = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (Constants as any).manifest2;
};
