# Welcome to Arcadeum Mobile App 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) for the Arcadeum gaming platform.

## Architecture Overview

The mobile app follows a **modular, type-safe architecture** designed for cross-platform development with React Native and Expo:

```
apps/mobile/
├── app/                     # File-based routing (Expo Router)
│   ├── (auth)/              # Authentication screens
│   ├── (games)/             # Game screens
│   ├── (tabs)/              # Tab navigation
│   ├── layout.tsx           # Root layout
│   └── +not-found.tsx       # 404 page
├── lib/                     # Core functionality
│   ├── i18n/                # Internationalization
│   │   ├── messages.ts      # Translation dictionaries
│   │   ├── types.ts         # Type utilities
│   │   ├── i18n.ts          # Translation hook
│   │   └── __examples__/    # Type safety examples
│   ├── api/                 # API clients
│   │   ├── client.ts        # Axios instance
│   │   └── endpoints.ts     # API endpoints
│   ├── stores/              # State management (Zustand)
│   │   ├── auth.store.ts    # Authentication state
│   │   └── game.store.ts    # Game state
│   ├── utils/               # Utility functions
│   │   ├── formatting.ts    # Date/number formatting
│   │   └── navigation.ts    # Navigation helpers
│   └── types/               # TypeScript types
├── components/              # Reusable UI components
│   ├── buttons/             # Button variants
│   ├── cards/               # Card components
│   ├── layouts/             # Layout components
│   └── modals/              # Modal components
├── assets/                  # Static assets
│   ├── images/              # Images
│   ├── fonts/               # Custom fonts
│   └── icons/               # Icons
├── constants/               # Constants
│   ├── colors.ts            # Color palette
│   ├── sizes.ts             # Spacing and sizing
│   └── strings.ts           # String constants
├── hooks/                   # Custom hooks
│   ├── useAuth.ts           # Authentication hook
│   └── useGame.ts           # Game hook
├── app.config.ts            # Expo configuration
├── app.json                 # App metadata
├── babel.config.js          # Babel configuration
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment variables template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- Git
- Xcode (for iOS development)
- Android Studio (for Android development)
- Expo CLI (`npm install -g expo-cli`)

### Installation

Install dependencies from the workspace root:

```bash
pnpm install
```

### Environment Setup

Create a `.env` file based on `.env.example` and fill in your Google OAuth values:

```bash
cp .env.example .env
# then edit .env with your client IDs and redirect URLs
```

#### Environment Variables

| Variable                            | Description                           | Example                                             |
| ----------------------------------- | ------------------------------------- | --------------------------------------------------- |
| `APP_SCHEME`                        | App deep link scheme (non-OAuth)      | `mobile`                                            |
| `EXPO_PUBLIC_APP_NAME`              | Display name shown in Expo clients    | `Arcadeum`                                          |
| `EXPO_PUBLIC_SUPPORT_URL`           | Support website URL                   | `https://arcadeum.com/support`                      |
| `EXPO_PUBLIC_SUPPORT_COFFEE_URL`    | Coffee donation URL                   | `https://buymeacoffee.com/arcadeum`                 |
| `EXPO_PUBLIC_SUPPORT_IBAN`          | Bank account for donations            | `DE44500105170648489890`                            |
| `AUTH_ISSUER`                       | OAuth issuer URL                      | `https://accounts.google.com`                       |
| `AUTH_ANDROID_CLIENT_ID`            | Android OAuth client ID               | `your-android-client-id.apps.googleusercontent.com` |
| `AUTH_ANDROID_REDIRECT_SCHEME`      | Reverse client ID scheme              | `com.googleusercontent.apps.your-client-id`         |
| `AUTH_IOS_CLIENT_ID`                | iOS OAuth client ID                   | `your-ios-client-id.apps.googleusercontent.com`     |
| `AUTH_IOS_REDIRECT_SCHEME`          | Reverse client ID scheme (Info.plist) | `com.googleusercontent.apps.your-client-id`         |
| `AUTH_WEB_CLIENT_ID`                | Web OAuth client ID                   | `your-web-client-id.apps.googleusercontent.com`     |
| `AUTH_WEB_REDIRECT_URL`             | Web redirect URL                      | `http://localhost:8081/auth/callback`               |
| `EXPO_PUBLIC_AUTH_WEB_CLIENT_ID`    | Web client ID (runtime)               | Same as AUTH_WEB_CLIENT_ID                          |
| `EXPO_PUBLIC_AUTH_WEB_REDIRECT_URL` | Web redirect URL (runtime)            | Same as AUTH_WEB_REDIRECT_URL                       |
| `NEXT_PUBLIC_API_URL`               | Backend API URL                       | `http://localhost:4000`                             |

#### URL Scheme Configuration

- Do not hand-edit `ios/mobile/Info.plist` for URL schemes
- `app.config.ts` injects the Google reverse scheme from `.env` (`AUTH_IOS_REDIRECT_SCHEME`)
- On Android, the app scheme is provided to the manifest via Gradle manifestPlaceholders from `APP_SCHEME`
- After changing `.env`, regenerate native config and verify:

```bash
pnpm exec expo prebuild --platform ios
pnpm exec expo config --type prebuild | grep -A3 CFBundleURLSchemes
```

### Running the App

```bash
# Start development server
pnpm --filter mobile dev
```

In the output, you'll find options to open the app in:

- **Development build** (recommended for production testing)
- **Android emulator** (via Android Studio)
- **iOS simulator** (via Xcode)
- **Expo Go** (limited sandbox for quick testing)

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Scripts

Convenient scripts defined in `package.json`:

| Command                  | Description                                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dev`                    | Unified dev flow. Starts Metro on localhost and the Web bundler, then launches Android (install/open) and iOS (run/open). Pass flags to target specific platforms, e.g. `pnpm run dev -- --android` or `--ios`. |
| `start`                  | Start Metro bundler via Expo                                                                                                                                                                                    |
| `start:localhost`        | Start Expo with host bound to `localhost` (stable for dev client URLs)                                                                                                                                          |
| `android:reverse`        | Create ADB reverse port for Metro (`8081`), required for device debugging                                                                                                                                       |
| `android:open`           | Open the Android dev client with a deep link to the local Metro URL. Uses `APP_SCHEME` (defaults to `mobile`)                                                                                                   |
| `android:dev`            | One-shot Android dev setup: reverse ports, start Expo (localhost), then open dev client                                                                                                                         |
| `android:clean`          | Clean the Android Gradle build                                                                                                                                                                                  |
| `android:assemble`       | Assemble a debug APK                                                                                                                                                                                            |
| `android:install`        | Install the debug build on a connected/emulated device                                                                                                                                                          |
| `android:check-redirect` | Verify the OAuth reverse scheme resolves to this app on Android                                                                                                                                                 |
| `ios:check-redirect`     | Verify the OAuth reverse scheme resolves to this app on iOS Simulator                                                                                                                                           |
| `ios:open`               | Open the iOS dev client in the booted Simulator using the configured scheme and Metro URL                                                                                                                       |
| `reset-project`          | Reset the starter code into `app-example/` and create a blank `app/`                                                                                                                                            |
| `android`                | Convenience wrapper: reverse ports, install debug build, then open the dev client                                                                                                                               |
| `ios`                    | Run `expo run:ios` (prebuild and run native project)                                                                                                                                                            |
| `web`                    | Start the web bundler (`expo start --web`). Note: `npm run dev` starts Web by default as part of the unified flow.                                                                                              |
| `lint`                   | Run ESLint via `expo lint`                                                                                                                                                                                      |
| `build`                  | Run TypeScript type checking                                                                                                                                                                                    |
| `type-check`             | Run TypeScript type checking                                                                                                                                                                                    |

## Project Structure

### File-Based Routing (Expo Router)

The app uses Expo Router for file-based routing:

```
app/
├── (auth)/                  # Authentication screens
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── (games)/                 # Game screens
│   ├── [id]/                # Game room screen
│   │   └── index.tsx
│   └── index.tsx            # Game selection
├── (tabs)/                  # Tab navigation
│   ├── home.tsx
│   ├── games.tsx
│   └── profile.tsx
├── layout.tsx               # Root layout
├── +not-found.tsx           # 404 page
└── index.tsx                # Root route
```

### State Management

The app uses **Zustand** for state management:

- `auth.store.ts`: Authentication state (user, tokens, loading)
- `game.store.ts`: Game state (current game, session, players)
- `ui.store.ts`: UI state (modals, notifications, loading)

### Internationalization (i18n)

- Type-safe translation system (see [Translation Type Safety](../../docs/TRANSLATION_TYPE_SAFETY.md))
- Hierarchical key structure: `common.actions.login`
- Fallback to English for missing translations
- RTL support for right-to-left languages

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feat/mobile/add-new-game
```

### 2. Develop Your Feature

- Use `pnpm --filter mobile dev` for development
- Create components in `components/` for reusable UI
- Implement logic in `lib/` for feature-specific code
- Use `hooks/` for custom hooks
- Use `stores/` for state management

### 3. Test Your Changes

```bash
# Run type checking
pnpm --filter mobile build

# Run ESLint
pnpm --filter mobile lint

# Test on device/emulator
pnpm --filter mobile dev --android
pnpm --filter mobile dev --ios
```

### 4. Format and Lint

```bash
# Format code
pnpm --filter mobile format

# Lint code
pnpm --filter mobile lint
```

### 5. Build and Deploy

```bash
# Build for production
pnpm --filter mobile build

# Create development build
pnpm --filter mobile build:development

# Create production build
pnpm --filter mobile build:production

# Deploy to Expo EAS Build
eas build --platform ios --profile development
eas build --platform android --profile development
```

## Testing Strategy

### Unit Tests (Jest)

- Test business logic and hooks
- Mock API calls with `jest.mock()`
- Use `@testing-library/react-native` for component testing

### E2E Tests (Detox)

- Test user flows across multiple screens
- Test authentication flows
- Test game interactions
- Run in headless mode for CI

### Accessibility Tests

- Use `@testing-library/user-event` for user interactions
- Test keyboard navigation
- Verify accessibility labels

## Performance Optimization

### Bundle Size

- Use code splitting for screens
- Optimize images with WebP format
- Remove unused dependencies
- Use Expo's asset optimization

### Memory Management

- Clean up event listeners and subscriptions
- Use React.memo for expensive components
- Avoid unnecessary re-renders
- Use stable references with useCallback

### Network

- Implement caching for API responses
- Use compression for API responses
- Implement retry logic for failed requests
- Use WebSockets for real-time updates instead of polling

## Deployment

### Expo EAS Build

EAS Build is used for creating production builds:

```bash
# Create development build
eas build --platform ios --profile development

# Create production build
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

### App Store Submission

1. Create Apple Developer account
2. Create App Store Connect app
3. Configure app icons and splash screens
4. Submit for review

### Google Play Submission

1. Create Google Play Developer account
2. Create app in Google Play Console
3. Configure app icons and screenshots
4. Submit for review

## Security

### Authentication

- Use OAuth with secure token storage
- Implement token refresh flow
- Use secure storage for sensitive data
- Implement proper logout functionality

### Data Handling

- Validate and sanitize all user input
- Use type-safe interfaces for data models
- Implement proper error handling without exposing sensitive information
- Follow the principle of least privilege for API access

### Code Security

- Avoid using `eval()` or similar dangerous functions
- Keep dependencies updated with `pnpm audit`
- Use security scanning tools like Snyk or Dependabot
- Review third-party packages for security vulnerabilities

### Network Security

- Use HTTPS exclusively in production
- Implement certificate pinning for sensitive endpoints
- Validate SSL certificates
- Use secure cookies for authentication tokens

## Internationalization (i18n)

### Translation Management

- Use type-safe translation keys (see [Translation Type Safety](../../docs/TRANSLATION_TYPE_SAFETY.md))
- Maintain consistent key naming conventions
- Use hierarchical structure for translation keys (e.g., `common.actions.login`)
- Provide fallback languages for missing translations
- Test translations with different languages and text lengths

### Localization Best Practices

- Format dates, numbers, and currencies according to locale
- Use proper text direction (LTR/RTL) for different languages
- Avoid concatenating translated strings
- Consider cultural differences in imagery and symbols
- Test with real users from target regions

## Accessibility

### iOS

- Use proper accessibility labels for UI components
- Support dynamic text sizing
- Implement voice control compatibility
- Ensure screen reader compatibility
- Test with VoiceOver

### Android

- Use proper accessibility labels for UI components
- Support dynamic text sizing
- Implement voice control compatibility
- Ensure screen reader compatibility
- Test with TalkBack

### Cross-Platform

- Follow WCAG 2.1 guidelines
- Test with assistive technologies
- Provide alternative input methods
- Ensure touch targets are at least 44x44 pixels
- Avoid color-only indicators for important information

## Code Review Checklist

Before submitting a PR, verify:

- [ ] Code follows project style guidelines
- [ ] All new code is properly documented
- [ ] Tests are included for new features and bug fixes
- [ ] Documentation is updated for user-facing changes
- [ ] No sensitive information is committed to repository
- [ ] Performance impacts are considered and optimized
- [ ] Accessibility requirements are met
- [ ] Internationalization considerations are addressed
- [ ] Security best practices are followed
- [ ] Code is clean and maintainable
- [ ] PR description clearly explains the changes
- [ ] Related issues are linked
- [ ] Screenshots or recordings are included for UI changes

## Support

For questions or issues with the mobile application:

1. Check this documentation first
2. Review existing component implementations
3. Create an issue with detailed description
4. Include reproduction steps and screenshots

Thank you for helping us build Arcadeum! 🎮

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
