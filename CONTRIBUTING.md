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

## Project Structure

- `apps/mobile`: Expo React Native app (iOS/Android)
- `apps/web`: Next.js web application
- `apps/be`: NestJS API server
- `docs`: General project documentation
- `scripts`: Maintenance and build scripts

Thank you for helping us build Arcadeum! 🎮
