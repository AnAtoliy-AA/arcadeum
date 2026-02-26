# Arcadeum

A monorepo for the Arcadeum gaming platform, featuring a mobile app, web application, and backend API.

**Live Demo:** [https://arcadeum.vercel.app/](https://arcadeum.vercel.app/)

## Documentation

Refer to the individual app READMEs for detailed setup and configuration instructions:

- [Contributing Guidelines](CONTRIBUTING.md)
- [Mobile App README](apps/mobile/README.md)
- [Web App README](apps/web/README.md)
- [Backend API README](apps/be/README.md)
- [Changelog](CHANGELOG.md): Detailed history of all releases and changes

### Translation Type Safety

- [Comprehensive Guide](docs/TRANSLATION_TYPE_SAFETY.md): Detailed explanation of the type-safe translation system
- [Implementation Summary](docs/TRANSLATION_TYPE_SAFETY.md): Summary of the implementation process and verification checklist

## Project Structure

This Turborepo workspace is managed with `pnpm` and contains:

- **`apps/mobile`**: Expo React Native app (iOS/Android)
- **`apps/web`**: Next.js web application
- **`apps/be`**: NestJS API server
- **`apps/shared`**: Shared utilities and components (if any)
- **`docs`**: Comprehensive project documentation
- **`scripts`**: Maintenance and build scripts

## Prerequisites

- **Node.js**: v18+ recommended
- **pnpm**: v9+ (Corepack enabled or installed globally)
- **Git**: For version control
- **MongoDB**: For backend development (local or cloud)
- **Expo CLI**: For mobile development (`npm install -g expo-cli`)

## Quick Start

1.  **Install dependencies**:

    ```bash
    pnpm install
    ```

2.  **Run development servers**:

    ```bash
    pnpm dev
    ```

    This will start all applications in parallel:

    - Web app on `http://localhost:3000`
    - Mobile app on `http://localhost:19000`
    - Backend API on `http://localhost:4000`

3.  **Specific App Development**:
    To run a specific app individually:

    ```bash
    # Mobile app
    pnpm --filter mobile dev

    # Web app
    pnpm --filter web dev

    # Backend API
    pnpm --filter be start:dev
    ```

## Common Commands

| Command            | Description                        |
| :----------------- | :--------------------------------- |
| `pnpm build`       | Build all applications             |
| `pnpm lint`        | Lint all applications              |
| `pnpm test`        | Run tests across the workspace     |
| `pnpm format`      | Format code using Prettier         |
| `pnpm turbo clean` | Clear Turborepo cache              |
| `pnpm audit`       | Check for security vulnerabilities |

## Development Best Practices

### Environment Variables

- Copy `.env.example` to `.env.local` in each app directory and populate with your values
- Environment variables are scoped to each app (mobile, web, be)
- Never commit `.env.local` files to version control
- Use `pnpm exec expo config --type public` to verify environment variables in mobile app

### Testing

- Run all tests: `pnpm test`
- Run specific test suites:
  - Web: `pnpm --filter web test`
  - Backend: `pnpm --filter be test`
  - Mobile: `pnpm --filter mobile test`
- Run E2E tests: `pnpm --filter web e2e` (Web) or `pnpm --filter be e2e` (Backend)
- Use `pnpm --filter web test:cov` to check test coverage

### Code Quality

- Linting is enforced via ESLint and Prettier
- Pre-commit hooks (via Husky) automatically run lint and format checks
- To run lint/format manually: `pnpm lint` and `pnpm format`
- Use `pnpm exec eslint --fix` to automatically fix linting issues

### Deployment

- Web app is deployed to Vercel (via GitHub integration)
- Backend is deployed to a cloud provider (check `apps/be/README.md` for details)
- Mobile app is distributed via Expo EAS Build
- Environment-specific deployments: staging (develop branch) and production (main branch)

### Debugging

- Check browser console for web issues
- Use Expo Dev Tools for mobile debugging (scan QR code from terminal)
- View backend logs with: `pnpm --filter be start:dev`
- Use Chrome DevTools for React debugging
- Enable React DevTools extension for browser debugging

## Troubleshooting

- **"Module not found" errors**: Run `pnpm install` and restart dev server
- **Port conflicts**: Kill processes on ports 3000 (web), 3333 (backend), or 19000 (mobile)
- **TypeScript errors**: Run `pnpm build` to see detailed type errors
- **Cache issues**: Clear Turborepo cache with `pnpm turbo clean`
- **Husky hooks failing**: Run `npx husky add .husky/pre-commit "pnpm lint && pnpm format"` to reinstall
- **Mobile app connection issues**: Ensure your device and computer are on the same network
- **Environment variables not loading**: Run `pnpm exec expo config --type public` to verify

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes
4. Push to your fork
5. Open a pull request
6. Ensure all tests pass and code is properly formatted

> 💡 Pro Tip: Use `pnpm turbo run build --filter=your-app-name` to build only the apps you're working on for faster development cycles.

## Security Best Practices

### Authentication

- Never hardcode API keys or secrets in source code
- Use environment variables for sensitive data
- Follow OAuth best practices for third-party authentication
- Use JWT with short expiration times (15 minutes)

### Data Handling

- Validate and sanitize all user input
- Use type-safe interfaces for data models
- Implement proper error handling without exposing sensitive information
- Follow the principle of least privilege for database access

### Code Security

- Avoid using `eval()` or similar dangerous functions
- Keep dependencies updated with `pnpm audit`
- Use security scanning tools like Snyk or Dependabot
- Review third-party packages for security vulnerabilities

### Testing Security

- Write security-focused tests for authentication flows
- Test for common vulnerabilities (XSS, CSRF, injection)
- Use security headers in web applications
- Validate authorization rules in both frontend and backend

## Performance Optimization

### Frontend (Web & Mobile)

- Implement lazy loading for components and routes
- Optimize images and assets (use WebP format)
- Use code splitting to reduce initial bundle size
- Implement caching strategies for API responses
- Minimize re-renders with React.memo and useCallback

### Backend

- Implement database indexing for frequently queried fields
- Use connection pooling for database connections
- Implement caching with Redis for frequently accessed data
- Optimize API responses with selective field projection
- Use compression (gzip) for API responses

### Network

- Implement proper HTTP caching headers
- Use CDN for static assets
- Optimize API endpoints to reduce round trips
- Implement pagination for large datasets
- Use WebSockets for real-time updates instead of polling

## Accessibility Standards

### Web Application

- Use semantic HTML elements
- Implement proper ARIA labels and roles
- Ensure keyboard navigation works for all interactive elements
- Maintain sufficient color contrast ratios (4.5:1 minimum)
- Provide text alternatives for non-text content

### Mobile Application

- Use proper accessibility labels for UI components
- Support dynamic text sizing
- Implement voice control compatibility
- Ensure screen reader compatibility
- Test with accessibility tools on both iOS and Android

### Cross-Platform

- Follow WCAG 2.1 guidelines
- Test with assistive technologies
- Provide alternative input methods
- Ensure touch targets are at least 44x44 pixels
- Avoid color-only indicators for important information

## Internationalization (i18n)

### Translation Management

- Use type-safe translation keys (see [Translation Type Safety](docs/TRANSLATION_TYPE_SAFETY.md))
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

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) which outlines our expectations for respectful and collaborative behavior.

## License

All contributions to Arcadeum are made under the [MIT License](LICENSE). By contributing, you agree that your contributions will be licensed under the same terms.

Thank you for helping us build Arcadeum! 🎮
