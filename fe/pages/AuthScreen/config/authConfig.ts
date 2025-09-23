import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const extra = (Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra ?? {}) as Record<string, string | undefined>;

const {
  AUTH_ISSUER,
  AUTH_ANDROID_CLIENT_ID,
  AUTH_IOS_CLIENT_ID,
  AUTH_WEB_CLIENT_ID,
  AUTH_ANDROID_REDIRECT_SCHEME,
  AUTH_IOS_REDIRECT_SCHEME,
  AUTH_WEB_REDIRECT_URL,
} = extra;

const clientId = Platform.select({
  android: AUTH_ANDROID_CLIENT_ID,
  ios: AUTH_IOS_CLIENT_ID,
  default: isWeb
    ? process.env.EXPO_PUBLIC_AUTH_WEB_CLIENT_ID || AUTH_WEB_CLIENT_ID
    : AUTH_WEB_CLIENT_ID,
});

const redirectUrl = Platform.select({
  android: AUTH_ANDROID_REDIRECT_SCHEME
    ? `${AUTH_ANDROID_REDIRECT_SCHEME}:/oauth2redirect/google`
    : undefined,
  ios: AUTH_IOS_REDIRECT_SCHEME
    ? `${AUTH_IOS_REDIRECT_SCHEME}:/oauth2redirect/google`
    : undefined,
  default: isWeb
    ? process.env.EXPO_PUBLIC_AUTH_WEB_REDIRECT_URL || AUTH_WEB_REDIRECT_URL
    : AUTH_WEB_REDIRECT_URL,
});

export const authConfig = {
  issuer: AUTH_ISSUER ?? 'https://accounts.google.com',
  clientId: clientId!,
  redirectUrl: redirectUrl!,
  scopes: ['openid', 'profile', 'email'],
};
