# Contributing to Arcadeum Web App

[General Contributing Guidelines](../../CONTRIBUTING.md) | [Mobile App Docs](../mobile/CONTRIBUTING.md) | [Backend Docs](../be/CONTRIBUTING.md)

---

This document provides comprehensive guidelines for developers who want to contribute to the Arcadeum web application.

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

- Node.js v18+
- pnpm

### First-Time Setup

```bash
# Clone the repository
git clone <repository-url>
cd arcadeum/apps/web

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
```

---

## Project Architecture

### Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Framework        | Next.js 16.1.0                                 |
| Language         | TypeScript                                     |
| Styling          | Styled Components + CSS Variables              |
| State Management | Zustand + React Context                        |
| Real-time        | Socket.io with optional AES-256-GCM encryption |
| API              | @tanstack/react-query                          |

### Directory Structure

```
apps/web/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home page
│   │   ├── auth/                     # Auth pages
│   │   ├── games/                    # Games pages
│   │   ├── chat/                     # Chat pages
│   │   ├── i18n/                     # Internationalization
│   │   ├── providers/                # Context providers
│   │   ├── theme/                    # Theme context
│   │   └── ...                       # Other pages
│   ├── shared/                       # Shared code
│   │   ├── config/                   # Configuration (theme, routes)
│   │   ├── ui/                       # Reusable UI components
│   │   ├── lib/                      # Utilities (API, translation, socket)
│   │   └── hooks/                    # Shared hooks
│   ├── entities/                     # Domain entities
│   │   ├── session/                  # Session management
│   │   └── support/                  # Support entity
│   ├── features/                     # Feature modules
│   │   ├── auth/                     # Authentication
│   │   ├── chat/                     # Chat
│   │   ├── games/                    # Games
│   │   ├── pwa/                      # PWA features
│   │   └── ...                       # Other features
│   └── widgets/                      # UI widgets
│       ├── header/                   # Header component
│       ├── CriticalGame/             # Critical game widget
│       ├── TexasHoldemGame/          # Texas Hold'em widget
│       └── SeaBattleGame/            # Sea Battle widget
├── public/                           # Static assets
├── styles/                           # Global styles
└── ...                               # Config files
```

### Key Concepts

#### 1. App Router (Next.js 13+)

Pages are defined by file structure in `app/`:

- `app/page.tsx` → `/` (Home)
- `app/games/page.tsx` → `/games`
- `app/games/[id]/page.tsx` → `/games/:id`

#### 2. State Management

Use Zustand for global state:

```typescript
// In entities/session/store/sessionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      snapshot: defaultSnapshot,
      setTokens: async (input) => {
        // ... implementation
      },
    }),
    {
      name: 'web_session_tokens_v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

#### 3. Theme System

The web app uses CSS variables for theming:

```typescript
// In shared/config/theme.ts
export const themeTokens: Record<ThemeName, ThemeTokens> = {
  light: lightTokens,
  dark: darkTokens,
  neonLight: neonLightTokens,
  neonDark: neonDarkTokens,
};
```

Theme is applied via CSS variables on `:root`:

```css
:root {
  --background: #151718;
  --foreground: #ecefee;
  --primary: #38bdf8;
}
```

#### 4. Internationalization

Use the `useTranslation` hook for all user-facing text:

```typescript
import { useTranslation } from '@/shared/lib/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <Text>{t('navigation.gamesTab')}</Text>
  );
}
```

Add translations in `shared/i18n/translations.ts`:

```typescript
export const translations = {
  en: {
    navigation: {
      gamesTab: 'Games',
      chatsTab: 'Chats',
    },
  },
  es: {
    navigation: {
      gamesTab: 'Juegos',
      chatsTab: 'Chats',
    },
  },
};
```

---

## Development Setup

### Environment Configuration

Create a `.env.local` file in `apps/web/`:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="Arcadeum"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_PRESENTATION_VIDEO_ID="your-video-id"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"

# OAuth Configuration
NEXT_PUBLIC_OAUTH_ISSUER="https://accounts.google.com"
NEXT_PUBLIC_OAUTH_CLIENT_ID="your-client-id"
NEXT_PUBLIC_OAUTH_REDIRECT_URI="http://localhost:3000/auth/callback"

# Optional
NEXT_PUBLIC_SUPPORT_URL="https://example.com/support"
NEXT_PUBLIC_DOWNLOAD_IOS="https://apps.apple.com/app/id..."
NEXT_PUBLIC_DOWNLOAD_ANDROID="https://play.google.com/store/apps/details?id=..."
NEXT_PUBLIC_SOCIAL_INSTAGRAM="..."
NEXT_PUBLIC_SOCIAL_DISCORD="..."
```

### Starting Development

```bash
# Start development server (Next.js + Storybook)
pnpm dev

# Start only Next.js
pnpm dev:next

# Start Storybook
pnpm storybook
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Storybook

Storybook is available at [http://localhost:6006](http://localhost:6006):

```bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
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
      "@/*": ["./src/*"]
    },
    "jsx": "react-jsx"
  }
}
```

**Key rules:**

- No implicit `any` types
- Use explicit types for all functions
- Prefer interfaces over types for objects

### Naming Conventions

| Pattern         | Example                                        |
| --------------- | ---------------------------------------------- |
| Component       | `Header`, `GameRoom`                           |
| Hook            | `useSessionStore`, `useTranslation`            |
| API Function    | `listGameRooms`, `createGameRoom`              |
| Translation Key | `navigation.gamesTab`, `common.actions.signIn` |
| Store           | `useSessionStore`, `useThemeStore`             |

### File Organization

**Feature modules** (`features/FeatureName/`):

```
features/
└── games/
    ├── api/                          # API calls
    │   └── gamesApi.ts
    ├── components/                   # Feature components
    │   ├── GameList.tsx
    │   └── GameCard.tsx
    ├── hooks/                        # Custom hooks
    │   └── useGameList.ts
    └── index.ts                      # Re-export
```

### Component Patterns

**Themed Component:**

```typescript
import { styled } from 'styled-components';
import { useThemeController } from '@/app/theme/ThemeContext';

function MyComponent() {
  const { theme } = useThemeController();

  return (
    <Container>
      <Title>My Component</Title>
    </Container>
  );
}

const Container = styled.div`
  background-color: ${props => props.theme.background.base};
  padding: 16px;
`;

const Title = styled.h1`
  color: ${props => props.theme.text.primary};
`;
```

**Zustand Store:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  games: Game[];
  setGames: (games: Game[]) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      games: [],
      setGames: (games) => set({ games }),
    }),
    {
      name: 'game_store',
    },
  ),
);
```

### Styling Best Practices

1. **Use styled-components** - For component-specific styles
2. **Use CSS variables** - For theme-aware values
3. **Keep styles local** - Define styles within component file

```typescript
// Good
const Container = styled.div`
  background-color: ${props => props.theme.background.base};
`;

// Bad
<div style={{ backgroundColor: 'var(--background)' }}>
```

### Accessibility

All interactive elements must have accessibility props:

```typescript
<button
  onClick={handleClick}
  aria-label={t('common.actions.signIn')}
  disabled={isLoading}
>
  {t('common.actions.signIn')}
</button>
```

---

## Working with Features

### Adding a New Page

1. **Create page file** in `app/`:

```typescript
// app/new-feature/page.tsx
import NewFeaturePage from '@/features/NewFeature/NewFeaturePage';

export default NewFeaturePage;
```

2. **Create page component** in `features/NewFeature/`:

```typescript
// features/NewFeature/NewFeaturePage.tsx
import React from 'react';

export default function NewFeaturePage() {
  return (
    <div>
      <h1>New Feature</h1>
    </div>
  );
}
```

### Adding a New Game Widget

1. **Create widget folder** in `widgets/`:

```
widgets/
└── NewGame/
    ├── NewGame.tsx
    ├── NewGame.types.ts
    └── index.ts
```

2. **Add to games catalog** in `features/games/catalog.ts`:

```typescript
export const gamesCatalog: GameCatalogueEntry[] = [
  {
    id: 'new_game_v1',
    name: 'New Game',
    // ... other properties
  },
];
```

### Working with Socket Events

Socket handlers are defined in `shared/lib/socket.ts`:

```typescript
// Add event handler
import { useSocket } from '@/shared/lib/socket';

useSocket('games.room.update', (payload) => {
  // Handle room update
});

// Emit event
import { gameSocket } from '@/shared/lib/socket';

gameSocket.emit('games.room.join', { roomId, userId });
```

### API Integration

Use React Query for data fetching:

```typescript
import { useQuery } from '@tanstack/react-query';
import { listGameRooms } from '@/features/games/api/gamesApi';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['gameRooms'],
    queryFn: () => listGameRooms(),
  });

  // ...
}
```

### Error Handling

Errors are handled by React Query and can be displayed using UI components:

```typescript
if (isLoading) return <LoadingState />;
if (error) return <ErrorState error={error} onRetry={refetch} />;
```

---

## Testing

### Running Tests

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

### Test File Structure

```typescript
// features/games/__tests__/gamesApi.test.ts
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Games API', () => {
  it('fetches game rooms', async () => {
    // Test implementation
  });
});
```

### Mocking

Use Vitest's mock functions for dependencies:

```typescript
vi.mock('@/features/games/api/gamesApi', () => ({
  listGameRooms: vi.fn(),
}));
```

---

## Deployment

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables

For production deployment, set these environment variables:

```bash
NEXT_PUBLIC_APP_NAME="Arcadeum"
NEXT_PUBLIC_API_BASE_URL="https://api.arcadeum.com"
NEXT_PUBLIC_OAUTH_CLIENT_ID="your-production-client-id"
```

### Vercel Deployment

The app is configured for Vercel deployment:

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## API & Backend Integration

### API Base URL Resolution

```typescript
// In shared/lib/api-base.ts
export function resolveApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  return fromEnv || 'http://localhost:4000';
}
```

### Authentication Flow

1. User initiates login → OAuth redirect
2. OAuth callback → `/auth/callback`
3. Code exchange → API call with token refresh
4. Session stored → Zustand store with localStorage persistence

### Socket Encryption

Enable encryption via environment variable:

```bash
NEXT_PUBLIC_SOCKET_ENCRYPTION_ENABLED=true
```

Encryption uses AES-256-GCM with runtime key exchange.

---

## Common Tasks

### Adding a New Theme

1. **Update `theme.ts`**:

```typescript
export const themeTokens: Record<ThemeName, ThemeTokens> = {
  // ... existing themes
  newTheme: {
    name: 'newTheme',
    background: { base: '#fff', ... },
    text: { primary: '#000', ... },
    // ... other tokens
  },
};
```

2. **Add to theme options**:

```typescript
export const THEME_OPTIONS: ThemePreference[] = [
  'system',
  'light',
  'dark',
  'neonLight',
  'neonDark',
  'newTheme',
];
```

### Adding a New Translation

1. **Add to translations file**:

```typescript
// shared/i18n/translations.ts
export const translations = {
  en: {
    common: {
      newKey: 'New value',
    },
  },
  es: {
    common: {
      newKey: 'Nuevo valor',
    },
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
console.log('Debug info', { session, games });
```

**React Query Devtools:**

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
      {/* ... */}
    </>
  );
}
```

---

## Pull Request Guidelines

Please refer to the [General Contributing Guidelines](../../CONTRIBUTING.md) for branch naming, commit messages, and PR requirements.

In addition for the Web App:

1. **Storybook**: Add stories for any new UI components.
2. **Responsive Design**: Verify changes across different screen sizes.
3. **PWA**: Ensure any changes don't break PWA functionality.

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Styled Components](https://styled-components.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)

---

## Questions?

For questions about contributing:

1. Check existing documentation
2. Review example implementations in the codebase
3. Open an issue for specific questions

Thank you for contributing to Arcadeum! 🎮
