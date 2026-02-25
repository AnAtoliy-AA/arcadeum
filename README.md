# Arcadeum

A monorepo for the Arcadeum gaming platform, featuring a mobile app, web application, and backend API.

**Live Demo:** [https://arcadeum.vercel.app/](https://arcadeum.vercel.app/)

## Documentation

Refer to the individual app READMEs for detailed setup and configuration instructions:

- [Contributing Guidelines](CONTRIBUTING.md)
- [Mobile App README](apps/mobile/README.md)
- [Web App README](apps/web/README.md)
- [Backend API README](apps/be/README.md)

## Project Structure

This Turborepo workspace is managed with `pnpm` and contains:

- **`apps/mobile`**: Expo React Native app (iOS/Android)
- **`apps/web`**: Next.js web application
- **`apps/be`**: NestJS API server

## Prerequisites

- **Node.js**: v18+ recommended
- **pnpm**: v9+ (Corepack enabled or installed globally)

## Quick Start

1.  **Install dependencies**:

    ```bash
    pnpm install
    ```

2.  **Run development servers**:

    ```bash
    pnpm dev
    ```

    This will start all applications in parallel.

3.  **Specific App Development**:
    To run a specific app individually:
    ```bash
    pnpm --filter mobile dev
    ```
    ```bash
    pnpm --filter web dev
    ```
    ```bash
    pnpm --filter be start:dev
    ```

## Common Commands

| Command       | Description                    |
| :------------ | :----------------------------- |
| `pnpm build`  | Build all applications         |
| `pnpm lint`   | Lint all applications          |
| `pnpm test`   | Run tests across the workspace |
| `pnpm format` | Format code using Prettier     |
