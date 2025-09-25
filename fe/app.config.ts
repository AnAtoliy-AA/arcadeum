import "dotenv/config";
import type { ExpoConfig } from "expo/config";

const iosRedirectScheme = process.env.AUTH_IOS_REDIRECT_SCHEME as
  | string
  | undefined;
const appScheme = (process.env.APP_SCHEME as string | undefined) ?? "mobile";

const config: ExpoConfig = {
  name: "mobile",
  slug: "mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: appScheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.mobile",
    ...(iosRedirectScheme
      ? {
          infoPlist: {
            CFBundleURLTypes: [
              {
                CFBundleURLSchemes: [iosRedirectScheme],
              },
            ],
          },
        }
      : {}),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.anonymous.mobile",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    APP_SCHEME: appScheme,
    // Sentry
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
    AUTH_ISSUER: process.env.AUTH_ISSUER,
    AUTH_ANDROID_CLIENT_ID: process.env.AUTH_ANDROID_CLIENT_ID,
    AUTH_IOS_CLIENT_ID: process.env.AUTH_IOS_CLIENT_ID,
    AUTH_WEB_CLIENT_ID: process.env.AUTH_WEB_CLIENT_ID,
    AUTH_ANDROID_REDIRECT_SCHEME: process.env.AUTH_ANDROID_REDIRECT_SCHEME,
    AUTH_IOS_REDIRECT_SCHEME: process.env.AUTH_IOS_REDIRECT_SCHEME,
    AUTH_WEB_REDIRECT_URL: process.env.AUTH_WEB_REDIRECT_URL,
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    // Router uses this at runtime
    router: {
      origin: false,
    },
  },
};

export default config;
