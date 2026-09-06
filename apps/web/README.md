# Arcadeum Games Web App

The Next.js web application for the Arcadeum Games platform.

**Live Deployment:** [https://arcadeum.vercel.app/](https://arcadeum.vercel.app/)

## Getting Started

### Prerequisites

- Node.js v24+ (see `../../.nvmrc`)
- pnpm
- Git

### Installation

Install dependencies from the workspace root:

```bash
pnpm install
```

### Environment Setup

Create a `.env.local` file in the `apps/web` directory. You can use the example file as a template:

```bash
cp .env.example .env.local
```

Ensure you configure the necessary environment variables for:

- **Backend API URL**: `NEXT_PUBLIC_API_URL` (default: `http://localhost:4000`)
- **Auth Provider**: Google OAuth credentials (`NEXT_PUBLIC_AUTH_WEB_CLIENT_ID`, `NEXT_PUBLIC_AUTH_WEB_REDIRECT_URL`)
- **Game Configuration**: Game-specific settings
- **Feature Flags**: Enable/disable experimental features

### Running the App

To start the development server:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

| Command          | Description                                      |
| :--------------- | :----------------------------------------------- |
| `pnpm dev`       | Start development server                         |
| `pnpm build`     | Build for production                             |
| `pnpm start`     | Start production server                          |
| `pnpm lint`      | Run ESLint                                       |
| `pnpm format`    | Format code with Prettier                        |
| `pnpm test`      | Run unit tests                                   |
| `pnpm e2e`       | Run end-to-end tests                             |
| `pnpm storybook` | Start Storybook for component development        |
| `pnpm analyze`   | Analyze bundle size with webpack-bundle-analyzer |

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React Compiler)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS with CSS-variable theming (`@arcadeum/ui` design tokens)
- **State Management**: Zustand for global state, React Context for scoped state, React Query for server state
- **Routing**: Next.js App Router with file-based routing
- **Real-time**: Socket.IO with AES-GCM encryption (7 named socket singletons)
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **Component Library**: `@arcadeum/ui` (63+ Tailwind components) with Storybook 10
- **Analytics**: PostHog, Vercel Analytics, and Speed Insights
- **PWA**: `@ducanh2912/next-pwa` with Workbox caching
- **Performance**: Next.js Image optimization, code splitting, lazy loading

## Architecture Documentation

For a comprehensive overview of the frontend architecture — including component organization, state flow, WebSocket encryption, i18n system, PWA strategy, and integration with the backend — see the full [Frontend Architecture Documentation](../docs/FRONTEND_ARCHITECTURE.md).

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/           # i18n dynamic segment
│   │   │   └── (app)/          # Route group with 43+ app routes
│   │   ├── api/                # Next.js API routes
│   │   └── layout.tsx          # Root layout
│   ├── features/               # 50+ feature modules
│   │   ├── auth/               # Authentication
│   │   ├── games/              # Game logic (registry, hooks, adapters)
│   │   ├── chat/               # Real-time chat
│   │   ├── payments/           # Payment processing
│   │   ├── wallet/             # Virtual wallet
│   │   ├── shop/               # In-game shop
│   │   ├── rankings/           # Player rankings
│   │   ├── tournaments/        # Tournament system
│   │   ├── achievements/       # Achievement tracking
│   │   ├── friends/            # Friend list
│   │   ├── clans/              # Clan system
│   │   ├── notifications/      # Push & in-app notifications
│   │   ├── admin/              # Admin panel
│   │   ├── pwa/                # PWA features
│   │   └── ...                 # Other features
│   ├── widgets/                # 12+ widget groups
│   │   ├── CriticalGame/       # Critical card game
│   │   ├── SeaBattleGame/      # Sea Battle game
│   │   ├── HeartsGame/         # Hearts card game
│   │   ├── GoGame/             # Go board game
│   │   ├── header/             # App header
│   │   ├── Footer/             # App footer
│   │   └── ...                 # Other game widgets
│   ├── entities/               # Domain entities
│   │   ├── session/            # Session management
│   │   ├── leaderboard/        # Leaderboard data
│   │   └── support/            # Support entity
│   ├── shared/                 # Cross-cutting concerns
│   │   ├── api/                # Client-side API modules
│   │   ├── config/             # Routes, themes, locale config
│   │   ├── hooks/              # 32+ custom React hooks
│   │   ├── i18n/               # Translation system (5 locales)
│   │   ├── lib/                # 55+ utility modules
│   │   └── types/              # Shared TypeScript interfaces
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── .env.example                # Environment variables template
└── next.config.ts              # Next.js configuration
```

## Environment Variables

| Variable                            | Description                 | Example                                     |
| ----------------------------------- | --------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL`               | Backend API URL             | `http://localhost:4000`                     |
| `NEXT_PUBLIC_AUTH_WEB_CLIENT_ID`    | Google OAuth client ID      | `your-client-id.apps.googleusercontent.com` |
| `NEXT_PUBLIC_AUTH_WEB_REDIRECT_URL` | OAuth redirect URL          | `http://localhost:3000/api/auth/callback`   |
| `NEXT_PUBLIC_FEATURE_FLAG_NEW_GAME` | Enable experimental feature | `true`                                      |
| `NEXT_PUBLIC_GA_ID`                 | Google Analytics ID         | `G-XXXXXXXXXX`                              |

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feat/web/add-new-game
```

### 2. Develop Your Feature

- Use `pnpm --filter web dev` for development
- Create components in `src/widgets/` for reusable UI
- Implement logic in `src/features/` for feature-specific code
- Use `src/shared/` for cross-app utilities

### 3. Test Your Changes

```bash
# Run unit tests
pnpm --filter web test

# Run E2E tests
pnpm --filter web e2e

# Run Storybook for component development
pnpm --filter web storybook
```

### 4. Format and Lint

```bash
# Format code
pnpm --filter web format

# Lint code
pnpm --filter web lint
```

### 5. Build and Deploy

```bash
# Build for production
pnpm --filter web build

# Analyze bundle size
pnpm --filter web analyze

# Deploy to Vercel (via GitHub integration)
# Push to develop branch for staging
# Push to main branch for production
```

## Component Development with Storybook

Storybook is used for developing and testing components in isolation:

```bash
# Start Storybook
pnpm --filter web storybook

# Access at http://localhost:6006
```

### Creating a New Component

1. Create component in `src/widgets/`
2. Create story file: `src/widgets/MyComponent/MyComponent.stories.tsx`
3. Add to Storybook with `export default` and `export const` stories

## Testing Strategy

### Unit Tests (Vitest)

- Test business logic and hooks
- Mock API calls with `vi.mock()`
- Use `@testing-library/react` for component testing

### E2E Tests (Playwright)

- Test user flows across multiple pages
- Test authentication flows
- Test game interactions
- Run in headless mode for CI

### Accessibility Tests

- Use `fireEvent`/`user-event` from `@testing-library/react` for user interactions
- Test keyboard navigation
- Verify ARIA attributes

## Performance Optimization

### Code Splitting

- Use `dynamic import()` for lazy loading components
- Split routes with Next.js App Router
- Lazy load game implementations

### Image Optimization

- Use Next.js Image component for all images
- Convert to WebP format where possible
- Use appropriate sizes and formats

### Caching

- Implement HTTP caching headers
- Use browser caching for static assets
- Implement service worker for PWA functionality

## Deployment

### Vercel Integration

- Automatic deployments on push to `develop` and `main` branches
- Preview deployments for PRs
- Environment-specific configurations

### Environment Configuration

- Production: `main` branch
- Staging: `develop` branch
- Environment variables configured in Vercel dashboard

### Monitoring

- Vercel Analytics and Speed Insights for performance metrics
- Vercel Logs for debugging

## Security

### Authentication

- JWT tokens with short expiration (15 minutes)
- Anonymous user support (`anon_*` IDs) for unauthenticated browsing
- Refresh token rotation with HttpOnly cookies
- HTTPS enforcement
- Secure cookie attributes
- CSRF protection (global guard)

### Input Validation

- Type-safe API responses
- Sanitize user input

### WebSocket Security

- AES-GCM encryption for all game data
- Runtime key exchange (keys not bundled)
- 7 named socket singletons with shared Manager

### Dependencies

- Regular security audits with `pnpm audit`
- Dependabot for automatic dependency updates
- Review third-party packages for security

## Internationalization (i18n)

- Type-safe translation system (see [Translation Type Safety](../../docs/TRANSLATION_TYPE_SAFETY.md))
- **5 locales**: en, ru, es, fr, by (Belarusian)
- Server-side: `getTranslations(locale)` | Client-side: `useTranslation()`
- SEO slugs translated per locale (e.g., `/fr/jeux` instead of `/fr/games`)
- Completeness test: `vitest run src/shared/i18n/messages/completeness.test.ts`

## Accessibility

- Semantic HTML elements
- Proper ARIA labels and roles
- Keyboard navigation support
- Sufficient color contrast (4.5:1 minimum)
- Screen reader compatibility
- Focus management

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

For questions or issues with the web application:

1. Check this documentation first
2. Review existing component implementations
3. Create an issue with detailed description
4. Include reproduction steps and screenshots

Thank you for helping us build Arcadeum Games! 🎮
