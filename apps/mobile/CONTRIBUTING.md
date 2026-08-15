# Contributing to Arcadeum Mobile App

[General Contributing Guidelines](../../CONTRIBUTING.md) | [Web App Docs](../web/CONTRIBUTING.md) | [Backend Docs](../be/CONTRIBUTING.md)

---

This document provides comprehensive guidelines for developers who want to contribute to the Arcadeum mobile app.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Development Setup](#development-setup)
- [Code Style & Conventions](#code-style--conventions)
- [Working with Features](#working-with-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [API & Backend Integration](#api--backend-integration)
- [Common Tasks](#common-tasks)

---

## Getting Started

### Prerequisites

- Node.js 18+ (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- pnpm (`npm install -g pnpm`)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### First-Time Setup

```bash
# Clone the repository
git clone <repository-url>
cd arcadeum/apps/mobile

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# (see Environment Configuration section below)
```

---

## Project Architecture

### Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Framework        | React Native 0.81.5 with Expo SDK 54           |
| Navigation       | Expo Router (file-based routing)               |
| State Management | React Context API                              |
| Styling          | Custom theme system + StyleSheet               |
| Real-time        | Socket.io with optional AES-256-GCM encryption |
| Authentication   | OAuth 2.0 (Google) + Local email/password      |

### Directory Structure

```
apps/mobile/
├── app/                          # Expo Router routes (file-based)
│   ├── _layout.tsx               # Root layout with providers
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home
│   │   ├── games.tsx            # Game rooms
│   │   ├── chats.tsx            # Chat list
│   │   ├── history.tsx          # Game history
│   │   └── settings.tsx         # Settings
│   ├── (tv)/                     # TV layout
│   ├── auth/                     # Auth screens
│   ├── games/                    # Game-related screens
│   └── ...                       # Other screens
├── pages/                        # Screen components (organized by feature)
│   ├── AuthScreen/
│   ├── GamesScreen/
│   ├── ChatScreen/
│   ├── History/
│   └── ...                       # Feature folders
├── components/                   # Reusable UI components
│   ├── ui/                       # Shared UI primitives
│   ├── cards/                    # Card components
│   └── history/                  # History-related components
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities and libraries
│   ├── i18n/                     # Internationalization
│   ├── apiMessageCatalog/        # API error translations
│   ├── socket-encryption.ts      # AES-256-GCM encryption
│   ├── fetchWithRefresh.ts       # Auth-aware fetch wrapper
│   └── ...                       # Other utilities
├── stores/                       # Context providers
│   ├── sessionTokens.tsx         # Auth state management
│   └── settings.tsx              # User preferences
├── constants/                    # Constants and themes
│   ├── Colors.ts                 # Theme palettes
│   ├── themes/neon.ts            # Neon theme colors
│   └── platform.ts               # Platform helpers
└── assets/                       # Static assets
```

### Key Concepts

#### 1. File-Based Routing (Expo Router)

Routes are defined by file structure in `app/`:

- `app/(tabs)/index.tsx` → `/` (Home tab)
- `app/games/create.tsx` → `/games/create`
- `app/games/rooms/[id].tsx` → `/games/rooms/:id`

**Reserved folders:**

- `(tabs)` - Tab navigation container
- `(tv)` - TV layout container

#### 2. State Management Pattern

Use Context providers for global state:

```typescript
// In stores/sessionTokens.tsx
const SessionTokensContext = createContext<...>();

export function SessionTokensProvider({ children }) {
  const [tokens, setTokens] = useState(...);
  // ... state management logic
  return (
    <SessionTokensContext.Provider value={value}>
      {children}
    </SessionTokensContext.Provider>
  );
}

export function useSessionTokens() {
  const ctx = useContext(SessionTokensContext);
  if (!ctx) throw new Error(...);
  return ctx;
}
```

#### 3. Themed Components

All components should use the theme system:

```typescript
import { useThemedStyles } from '@/hooks/useThemedStyles';

function MyComponent() {
  const styles = useThemedStyles(createStyles);
  // ...
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { backgroundColor: palette.background },
    text: { color: palette.text },
  });
}
```

#### 4. Internationalization

Use the `useTranslation` hook for all user-facing text:

```typescript
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <Text>{t('games.room.title')}</Text>
  );
}
```

Add translations in `lib/i18n/messages/`:

```typescript
// lib/i18n/messages/games.ts
export const gamesMessages = {
  en: { room: { title: 'Game Room' } },
  es: { room: { title: 'Sala de Juego' } },
  fr: { room: { title: 'Salle de Jeu' } },
};
```

---

## Development Setup

### Environment Configuration

Create a `.env` file in `apps/mobile/`:

```bash
# App Configuration
EXPO_PUBLIC_APP_NAME="Arcadeum"
EXPO_PUBLIC_APP_SLUG="arcadeum"
APP_SCHEME="mobile"

# API Configuration
EXPO_PUBLIC_API_BASE_URL="http://localhost:4000"
EXPO_PUBLIC_WS_BASE_URL="http://localhost:4000"

# OAuth Configuration (Google)
AUTH_ISSUER="https://accounts.google.com"
AUTH_ANDROID_CLIENT_ID="your-android-client-id.apps.googleusercontent.com"
AUTH_ANDROID_REDIRECT_SCHEME="com.googleusercontent.apps.your-id"
AUTH_IOS_CLIENT_ID="your-ios-client-id.apps.googleusercontent.com"
AUTH_IOS_REDIRECT_SCHEME="com.googleusercontent.apps.your-id"
AUTH_WEB_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
AUTH_WEB_REDIRECT_URL="http://localhost:8081/auth/callback"

# Optional
EXPO_PUBLIC_SUPPORT_URL="https://example.com/support"
EXPO_PUBLIC_SUPPORT_COFFEE_URL="https://buymeacoffee.com/example"
EXPO_PUBLIC_SUPPORT_IBAN="YOUR_IBAN_HERE"
```

### Starting Development

```bash
# Start development server (all platforms)
pnpm dev

# Start with specific platform
pnpm android    # Android emulator/device
pnpm ios        # iOS simulator (macOS only)
pnpm web        # Web browser

# For localhost development (device debugging)
pnpm start:localhost
```

### Device Debugging

**Android:**

```bash
# One-command setup for Android device
pnpm android:dev

# Or manual setup
pnpm android:reverse    # ADB port forwarding
pnpm start:localhost    # Start Metro on localhost
pnpm android:open       # Open dev client
```

**iOS:**

```bash
# Check redirect URL resolution
pnpm ios:check-redirect

# Open iOS dev client
pnpm ios:open
```

---

## Code Style & Conventions

### TypeScript Configuration

The project uses strict TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    },
    "jsx": "react-jsx"
  }
}
```

**Key rules:**

- No `any` types (enforced by ESLint)
- Use explicit types for all functions
- Prefer interfaces over types for objects

### Naming Conventions

| Pattern         | Example                                     |
| --------------- | ------------------------------------------- |
| Component       | `ThemedView`, `GameRoomScreen`              |
| Hook            | `useSessionTokens`, `useThemedStyles`       |
| API Function    | `listGameRooms`, `createGameRoom`           |
| Translation Key | `games.room.title`, `common.actions.signIn` |
| Style Factory   | `createRoomStyles`, `createGameStyles`      |

### File Organization

**Screen components** (`pages/FeatureName/`):

```
pages/
└── GamesScreen/
    ├── GamesScreen.tsx              # Main screen component
    ├── api/                         # API calls specific to this feature
    │   └── gamesApi.ts
    ├── components/                  # Screen-specific components
    │   ├── GamesHeader.tsx
    │   ├── FilterSection.tsx
    │   └── RoomsList.tsx
    ├── hooks/                       # Custom hooks
    │   ├── useGamesScreenState.ts
    │   ├── useRoomActions.ts
    │   └── useFilterOptions.ts
    ├── styles/                      # Screen-specific styles
    │   ├── hero.ts
    │   ├── layout.ts
    │   └── roomItem.ts
    ├── types.ts                     # TypeScript types
    └── index.ts                     # Re-export
```

### Component Patterns

**Themed Component:**

```typescript
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export function MyComponent() {
  const styles = useThemedStyles(createStyles);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Title</ThemedText>
      <ThemedText>Content</ThemedText>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.background,
      padding: 16,
    },
  });
}
```

**Focusable Component (TV support):**

```typescript
import { Focusable } from '@/components/ui/Focusable';

<Focusable
  onPress={handlePress}
  focusScale={1.05}
  accessibilityLabel="Action button"
>
  <Text>Press me</Text>
</Focusable>
```

### Styling Best Practices

1. **Always use themed colors** - Never hardcode color values
2. **Use StyleSheet.create** - For performance
3. **Keep styles local** - Define styles within component file
4. **Responsive spacing** - Use consistent spacing values

```typescript
// Good
const styles = useThemedStyles(createStyles);

// Bad
<View style={{ backgroundColor: '#fff' }}>
```

### Accessibility

All interactive elements must have accessibility props:

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={t('common.actions.signIn')}
  accessibilityState={{ disabled }}
>
  <Text>{t('common.actions.signIn')}</Text>
</TouchableOpacity>
```

---

## Working with Features

### Adding a New Screen

1. **Create route file** in `app/`:

```typescript
// app/new-feature.tsx
import NewFeatureScreen from '@/pages/NewFeature/NewFeatureScreen';

export default NewFeatureScreen;
```

2. **Create screen component** in `pages/NewFeature/`:

```typescript
// pages/NewFeature/NewFeatureScreen.tsx
import React from 'react';
import { ThemedView } from '@/components/ThemedView';

export default function NewFeatureScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Text>New Feature</Text>
    </ThemedView>
  );
}
```

3. **Add to navigation** in `app/_layout.tsx`:

```typescript
<Stack.Screen name="new-feature" />
```

### Adding a New Game Integration

1. **Create integration folder** in `pages/GamesScreen/gameIntegrations/`:

```
pages/GamesScreen/gameIntegrations/
└── NewGame/
    ├── NewGameRoom.tsx
    ├── NewGameRoom.types.ts
    ├── NewGameRoom.styles.ts
    └── NewGameRoom.hooks.ts
```

2. **Implement handle interface**:

```typescript
export interface NewGameRoomHandle {
  onSessionSnapshot: () => void;
  onSessionStarted: () => void;
  onException: () => void;
}
```

3. **Add to catalog** in `pages/GamesScreen/catalog.ts`:

```typescript
export const gamesCatalog: GameCatalogueEntry[] = [
  {
    id: 'new_game_v1',
    name: 'New Game',
    // ... other properties
    isPlayable: true,
  },
];
```

### Working with Socket Events

Socket handlers are defined in `useGameRoomSocket.ts`:

```typescript
// Add event handler
socket.on('games.room.update', decryptHandler(handleRoomUpdate));

// Emit event
import { gameSocket as socket } from '@/hooks/useSocket';

socket.emit('games.room.join', { roomId, userId });
```

### API Integration

Use `fetchWithRefresh` for authenticated requests:

```typescript
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { resolveApiBase } from '@/lib/apiBase';

export async function createGameRoom(
  params: CreateGameRoomParams,
  options?: FetchWithRefreshOptions,
): Promise<CreateGameRoomResponse> {
  const response = await fetchWithRefresh(
    `${resolveApiBase()}/games/rooms`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    },
    options,
  );
  return response.json();
}
```

### Error Handling

Use the API message catalog for consistent error messages:

1. **Add descriptor** in `lib/apiMessageCatalog/descriptors/`:

```typescript
export const gamesDescriptors: ApiMessageDescriptor[] = [
  {
    code: 3052,
    translationKey: 'api.games.newError',
    fallbackMessage: 'New error occurred.',
    aliases: ['games.newError'],
  },
];
```

2. **Use in API calls** - Errors are automatically translated

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test -- path/to/test.tsx
```

### Test File Structure

```typescript
// pages/GamesScreen/__tests__/GamesScreen.test.tsx
import { render, screen } from '@testing-library/react-native';
import GamesScreen from '../GamesScreen';

describe('GamesScreen', () => {
  it('renders correctly', () => {
    render(<GamesScreen />);
    expect(screen.getByText('Games Lounge')).toBeInTheDocument();
  });
});
```

### Mocking

Use Jest's mock functions for dependencies:

```typescript
jest.mock('@/stores/sessionTokens', () => ({
  useSessionTokens: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
```

---

## Deployment

### Build Artifacts

```bash
# Build for all platforms
pnpm build:artifacts

# Build web
pnpm export:web

# Build Android
pnpm android:assemble

# Build iOS
pnpm exec eas build --profile preview --platform ios
```

### EAS Build Configuration

Configured in `eas.json`:

```json
{
  "builds": {
    "android": {
      "preview": {
        "distribution": "internal",
        "androidBuildType": "apk"
      }
    },
    "ios": {
      "preview": {
        "distribution": "internal"
      }
    }
  }
}
```

### Environment-Specific Builds

Use different `.env` files:

```bash
# Development
cp .env.example .env
pnpm dev

# Production
cp .env.example .env.production
# Edit .env.production with production values
```

---

## API & Backend Integration

### API Base URL Resolution

The app automatically resolves API URLs based on platform:

```typescript
// In lib/apiBase.ts
export function resolveApiBase(): string {
  // Returns configured API_BASE_URL
  // For native: resolves localhost to device IP
  // For web: uses direct URL
}
```

### Authentication Flow

1. User initiates login → `loginWithOAuth()`
2. OAuth redirect → `/auth/callback`
3. Code exchange → `fetchWithRefresh()` with token refresh
4. Session stored → `setTokens()` in `SessionTokensProvider`

### Socket Encryption

Enable encryption via environment variable:

```bash
EXPO_PUBLIC_SOCKET_ENCRYPTION_ENABLED=true
```

Encryption uses AES-256-GCM with runtime key exchange.

---

## Common Tasks

### Adding a New Theme

1. **Update `Colors.ts`**:

```typescript
export const Colors: Record<'light' | 'dark' | 'neonLight' | 'neonDark' | 'newTheme', ...> = {
  newTheme: {
    isLight: false,
    text: '#fff',
    background: '#000',
    // ... other colors
  },
};
```

2. **Add to settings** in `stores/settings.tsx`:

```typescript
export const themePreferences = [
  // ... existing themes
  {
    code: 'newTheme',
    labelKey: 'settings.themeOptions.newTheme.label',
    descriptionKey: 'settings.themeOptions.newTheme.description',
  },
];
```

### Adding a New Translation

1. **Add to message file**:

```typescript
// lib/i18n/messages/common.ts
export const commonMessages = {
  en: {
    newKey: 'New value',
  },
  es: {
    newKey: 'Nuevo valor',
  },
  fr: {
    newKey: 'Nouvelle valeur',
  },
};
```

2. **Use in component**:

```typescript
const { t } = useTranslation();
t('common.newKey');
```

### Debugging

**Console logging:**

```typescript
console.log('Debug info', { room, session });
```

**Error handling:**

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  console.error('Operation failed:', error);
  Alert.alert(
    'Error',
    error instanceof Error ? error.message : 'Unknown error',
  );
}
```

---

## Pull Request Guidelines

Please refer to the [General Contributing Guidelines](../../CONTRIBUTING.md) for branch naming, commit messages, and PR requirements.

In addition for the Mobile App:

1. **Platform Independence**: Ensure changes work on both iOS and Android.
2. **TV Support**: Verify focus management if changing UI.
3. **Expo Config**: Be careful when modifying `app.json` or `eas.json`.

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## Questions?

For questions about contributing:

1. Check existing documentation
2. Review example implementations in the codebase
3. Open an issue for specific questions

Thank you for contributing to Arcadeum! 🎮
