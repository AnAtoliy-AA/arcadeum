# Arcadeum Web App

The Next.js web application for the Arcadeum platform.

**Live Deployment:** [https://arcadeum.vercel.app/](https://arcadeum.vercel.app/)

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- Git
- MongoDB (for local development)
- Expo CLI (for mobile integration testing)

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

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: React Context for global state, Zustand for complex state
- **Routing**: Next.js App Router with file-based routing
- **API Client**: Axios with interceptors for authentication
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Component Library**: Custom design system with Storybook
- **Analytics**: Vercel Analytics, Sentry for error tracking
- **Performance**: Next.js Image optimization, code splitting, lazy loading

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── games/              # Game room pages
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # User dashboard
│   │   └── layout.tsx          # Root layout
│   ├── features/               # Feature-based organization
│   │   ├── games/              # Game-related logic
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── ui/             # UI components
│   │   │   └── registry.ts     # Game registry
│   │   ├── auth/               # Authentication logic
│   │   └── shared/             # Shared utilities
│   ├── widgets/                # Reusable UI components
│   │   └── games/              # Game-specific widgets
│   ├── lib/                    # Utility functions
│   │   ├── api/                # API clients
│   │   ├── auth/               # Authentication utilities
│   │   └── utils/              # General utilities
│   ├── shared/                 # Shared code across apps
│   │   └── i18n/               # Translation system
│   ├── styles/                 # Global styles
│   ├── types/                  # TypeScript types
│   └── components/             # Reusable components
├── public/                     # Static assets
├── .env.example                # Environment variables template
└── next.config.js              # Next.js configuration
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

### Unit Tests (Jest)

- Test business logic and hooks
- Mock API calls with `jest.mock()`
- Use `@testing-library/react` for component testing

### E2E Tests (Playwright)

- Test user flows across multiple pages
- Test authentication flows
- Test game interactions
- Run in headless mode for CI

### Accessibility Tests

- Use `@testing-library/user-event` for user interactions
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

- Vercel Analytics for performance metrics
- Sentry for error tracking
- Vercel Logs for debugging

## Security

### Authentication

- JWT tokens with short expiration (15 minutes)
- HTTPS enforcement
- Secure cookie attributes
- CSRF protection

### Input Validation

- Server-side validation with Zod
- Type-safe API responses
- Sanitize user input

### Dependencies

- Regular security audits with `pnpm audit`
- Dependabot for automatic dependency updates
- Review third-party packages for security

## Internationalization (i18n)

- Type-safe translation system (see [Translation Type Safety](../../docs/TRANSLATION_TYPE_SAFETY.md))
- Hierarchical key structure: `common.actions.login`
- Fallback to English for missing translations
- RTL support for right-to-left languages

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

Thank you for helping us build Arcadeum! 🎮
