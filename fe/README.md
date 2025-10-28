# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Environment setup

Create a `.env` file based on `.env.example` and fill in your Google OAuth values:

```bash
cp .env.example .env
# then edit .env with your client IDs and redirect URLs
```

- `APP_SCHEME`: App deep link scheme (non-OAuth). Default: `mobile`.
- `EXPO_PUBLIC_APP_NAME`: Display name shown in Expo clients. Default: `Arcadeum`.
- `EXPO_PUBLIC_SUPPORT_URL` / `EXPO_PUBLIC_SUPPORT_COFFEE_URL`: Optional external links for the Support screen sponsorship buttons.
- `AUTH_ISSUER`: Usually `https://accounts.google.com`.
- `AUTH_ANDROID_CLIENT_ID`: Android OAuth client ID (ends with `.apps.googleusercontent.com`).
- `AUTH_ANDROID_REDIRECT_SCHEME`: Reverse client ID scheme (e.g., `com.googleusercontent.apps.<id>`). If omitted, Android build derives it from the client ID.
- `AUTH_IOS_CLIENT_ID`: iOS OAuth client ID.
- `AUTH_IOS_REDIRECT_SCHEME`: Reverse client ID scheme registered in Info.plist.
- `AUTH_WEB_CLIENT_ID`: Web OAuth client ID (if using web flow).
- `AUTH_WEB_REDIRECT_URL`: Web redirect URL (e.g., `http://localhost:8081/auth/callback`).
- `EXPO_PUBLIC_AUTH_WEB_CLIENT_ID` / `EXPO_PUBLIC_AUTH_WEB_REDIRECT_URL`: Same as web vars, exposed at runtime.

See `.env.example` for detailed comments and examples.

Note on URL schemes:
- Do not hand-edit `ios/mobile/Info.plist` for URL schemes.
- `app.config.ts` injects the Google reverse scheme from `.env` (`AUTH_IOS_REDIRECT_SCHEME`) and sets the app scheme from `APP_SCHEME` (default `mobile`).
- On Android, the app scheme is provided to the manifest via Gradle manifestPlaceholders from `APP_SCHEME`.
- After changing `.env`, regenerate native config and verify:

```bash
npx expo prebuild --platform ios
npx expo config --type prebuild | grep -A3 CFBundleURLSchemes
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Verify env config

After creating your `.env`, you can confirm that `app.config.ts` reads the variables correctly:

```bash
npx expo config --type public | grep -E 'AUTH_|router'
```

You should see your `AUTH_*` values and the router config reflected in the output.

## Error reporting (Sentry)

- Set `EXPO_PUBLIC_SENTRY_DSN` in `.env` to enable Sentry in the mobile app.
- Sentry is initialized in `app/_layout.tsx` via `fe/sentry.ts`.
- For backend reporting, set `SENTRY_DSN` in `be/.env`.

Sentry CLI (build-time uploads) via environment variables:

- `SENTRY_AUTH_TOKEN` ↔ `auth.token`
- `SENTRY_ORG` ↔ `defaults.org`
- `SENTRY_PROJECT` ↔ `defaults.project`
- `SENTRY_URL` (optional) ↔ `defaults.url` (default `https://sentry.io/`)

Example properties file (for local only): `fe/.sentry.properties.example`

- Prefer CI env vars; avoid committing a real `.sentry.properties`.
- Native `sentry.properties` files under `android/` and `ios/` are git-ignored.

## Scripts

Convenient scripts defined in `package.json`:

- `dev`: Unified dev flow. Starts Metro on localhost and the Web bundler, then launches Android (install/open) and iOS (run/open). Pass flags to target specific platforms, e.g. `npm run dev -- --android` or `--ios`.
- `start`: Start Metro bundler via Expo.
- `start:localhost`: Start Expo with host bound to `localhost` (stable for dev client URLs).
- `android:reverse`: Create ADB reverse port for Metro (`8081`), required for device debugging.
- `android:open`: Open the Android dev client with a deep link to the local Metro URL. Uses `APP_SCHEME` (defaults to `mobile`).
- `android:dev`: One-shot Android dev setup: reverse ports, start Expo (localhost), then open dev client.
- `android:clean`: Clean the Android Gradle build.
- `android:assemble`: Assemble a debug APK.
- `android:install`: Install the debug build on a connected/emulated device.
- `android:check-redirect`: Verify the OAuth reverse scheme resolves to this app on Android.
- `ios:check-redirect`: Verify the OAuth reverse scheme resolves to this app on iOS Simulator.
- `ios:open`: Open the iOS dev client in the booted Simulator using the configured scheme and Metro URL.
- `reset-project`: Reset the starter code into `app-example/` and create a blank `app/`.
- `android`: Convenience wrapper: reverse ports, install debug build, then open the dev client.
- `ios`: Run `expo run:ios` (prebuild and run native project).
- `web`: Start the web bundler (`expo start --web`). Note: `npm run dev` starts Web by default as part of the unified flow.
- `lint`: Run ESLint via `expo lint`.

Tip: For Android dev on device/emulator, try:

```bash
npm run android:dev
```

Test your app scheme

- iOS Simulator:

```bash
xcrun simctl openurl booted $(node -e "console.log(require('expo-constants').expoConfig?.extra?.APP_SCHEME || 'mobile')")://test
```

- Android emulator/device:

```bash
SCHEME=$(node -e "console.log(require('expo-constants').expoConfig?.extra?.APP_SCHEME || 'mobile')") && \
adb shell am start -a android.intent.action.VIEW -d "$SCHEME://test"
```
