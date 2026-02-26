# Contributing to Arcadeum

Thank you for your interest in contributing to Arcadeum! This document outlines the general guidelines and conventions for contributing to the entire project.

Arcadeum is a monorepo containing several applications and services. For specific instructions on each part of the project, please refer to their respective contributing guides:

- [Web Application](apps/web/CONTRIBUTING.md)
- [Mobile Application](apps/mobile/CONTRIBUTING.md)
- [Backend API](apps/be/CONTRIBUTING.md)

---

## Branch Naming Conventions

> [!IMPORTANT]
> All contributions should be made to the `develop` branch. Pull Requests should target `develop` as the base branch.

We use a structured branching model to keep our development organized. All branches should follow this format:

`<type>/<target>/<short-description>`

### Types

- `feat`: New features or enhancements
- `fix`: Bug fixes
- `refactor`: Code restructuring without functional changes
- `docs`: Documentation updates
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build configuration, etc.)

### Targets

- `web`: Changes affecting the web application
- `mobile`: Changes affecting the mobile application
- `be`: Changes affecting the backend API
- `root`: Changes affecting the workspace root (CI/CD, dependencies, global docs)

### Examples

- `feat/web/add-leaderboard`
- `fix/mobile/crash-on-join`
- `docs/root/update-contributing-guide`

---

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format: `<type>(<scope>): <description>`

### Scopes

Use the application name or component as the scope (e.g., `web`, `mobile`, `be`, `shared`, `ci`).

### Examples

- `feat(web): add support for dark mode`
- `fix(mobile): resolve layout issue on tablets`
- `chore(root): update pnpm to v9`
- `docs(web): fix typo in README`

---

## Pull Request Guidelines

Before submitting a Pull Request, please ensure:

1.  **Follow Existing Patterns**: Ensure your code matches the style and patterns of the surrounding codebase.
2.  **Test Your Changes**: Verify your changes with unit and/or E2E tests.
3.  **Update Documentation**: If your changes introduce new features or change existing ones, update the relevant documentation.
4.  **One Feature Per PR**: Keep PRs focused. If you have multiple unrelated changes, split them into separate PRs.
5.  **Clear PR Description**: Use our PR template to explain what your changes do and why.

---

## Pull Request Description Template

When creating a PR, please use the following template (this is also available automatically in the GitHub PR interface):

```markdown
## Description

Provide a brief summary of the changes and the motivation behind them.

## Related Issues

Link to any related issues (e.g., Fixes #123).

## Changes Made

- List the specific changes made.

## Screenshots (if applicable)

Add screenshots or screen recordings to demonstrate UI changes.

## Checklist

- [ ] My code follows the project's style guidelines.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] I have made corresponding changes to the documentation.
- [ ] My changes generate no new warnings.
- [ ] I have added tests that prove my fix is effective or that my feature works.
- [ ] New and existing unit tests pass locally with my changes.
```

---

## Development Workflow

### Setting Up Your Environment

1.  **Fork the repository** and clone your fork:

    ```bash
    git clone https://github.com/YOUR_USERNAME/arcadeum.git
    cd arcadeum
    ```

2.  **Add upstream remote** to sync with main repository:

    ```bash
    git remote add upstream https://github.com/arcadeum/arcadeum.git
    ```

3.  **Install dependencies**:

    ```bash
    pnpm install
    ```

4.  **Set up pre-commit hooks** (automatically installed during `pnpm install`):
    - Linting and formatting will run automatically before each commit
    - If you need to bypass for testing: `git commit --no-verify`

### Working on Features

1.  **Create a feature branch** using the naming convention:

    ```bash
    git checkout develop
    git pull upstream develop
    git checkout -b feat/web/add-new-game
    ```

2.  **Develop your feature**:

    - Use `pnpm --filter web dev` for web development
    - Use `pnpm --filter mobile dev` for mobile development
    - Use `pnpm --filter be start:dev` for backend development

3.  **Run tests frequently**:

    ```bash
    # Run all tests
    pnpm test

    # Run tests for specific app
    pnpm --filter web test
    pnpm --filter be test
    pnpm --filter mobile test

    # Run E2E tests (web)
    pnpm --filter web e2e
    ```

4.  **Format your code** before committing:

    ```bash
    pnpm format
    ```

5.  **Lint your code**:
    ```bash
    pnpm lint
    ```

### Submitting Your PR

1.  **Commit your changes** with conventional commit format:

    ```bash
    git add .
    git commit -m "feat(web): add new game feature"
    ```

2.  **Push to your fork**:

    ```bash
    git push origin feat/web/add-new-game
    ```

3.  **Create a Pull Request** on GitHub targeting `develop`

4.  **Address feedback** and push additional commits to the same branch

---

## Code Quality Standards

### TypeScript

- Always use strict typing
- Prefer interfaces over types for object shapes
- Avoid `any` - use `unknown` and type guards instead
- Use enums sparingly; prefer const objects when possible

### React (Web & Mobile)

- Use functional components with hooks
- Follow component structure: props, state, effects, render
- Use TypeScript interfaces for component props
- Keep components small and focused (under 100 lines when possible)

### Backend (NestJS)

- Follow service-controller-repository pattern
- Use DTOs for request/response validation
- Implement proper error handling with exceptions
- Use guards for authentication/authorization

### Shared Code

- Place reusable code in `apps/shared` or create a new package if needed
- Avoid circular dependencies between apps
- Keep shared code minimal and focused

### Testing

- Write unit tests for all business logic
- Write E2E tests for critical user flows
- Use Jest for unit tests and Playwright for E2E tests
- Aim for >80% test coverage for new features

### Documentation

- Document complex logic with comments
- Update API documentation when changing endpoints
- Add new components to Storybook if applicable (web)
- Update READMEs in affected apps

---

## Project Structure

- `apps/mobile`: Expo React Native app (iOS/Android)
- `apps/web`: Next.js web application
- `apps/be`: NestJS API server
- `apps/shared`: Shared code and utilities (if any)
- `docs`: General project documentation
- `scripts`: Maintenance and build scripts
- `.husky`: Git hooks configuration
- `.github/workflows`: CI/CD pipelines

---

## CI/CD Workflow

- **All PRs** trigger automated tests and linting via GitHub Actions
- **Merge to `develop`** triggers deployment to staging environment
- **Merge to `main`** triggers production deployment
- **E2E tests** run against staging environment before merge

---

## Troubleshooting Common Issues

- **"Module not found" errors**: Run `pnpm install` and restart dev server
- **Port conflicts**: Kill processes on ports 3000 (web), 3333 (backend), or 19000 (mobile)
- **TypeScript errors**: Run `pnpm build` to see detailed type errors
- **Cache issues**: Clear Turborepo cache with `pnpm turbo clean`
- **Husky hooks failing**: Run `npx husky add .husky/pre-commit "pnpm lint && pnpm format"` to reinstall

---

## Getting Help

If you're stuck:

1. Check the [GitHub Discussions](https://github.com/arcadeum/arcadeum/discussions)
2. Ask in our [Discord server](link-to-discord) (if available)
3. Tag a maintainer in your PR with a specific question

---

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

---

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

---

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

---

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

---

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

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) which outlines our expectations for respectful and collaborative behavior.

---

## License

All contributions to Arcadeum are made under the [MIT License](LICENSE). By contributing, you agree that your contributions will be licensed under the same terms.

Thank you for helping us build Arcadeum! 🎮
