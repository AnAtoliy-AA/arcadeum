# Contributing to Arcadeum Backend API

[General Contributing Guidelines](../../CONTRIBUTING.md) | [Web App Docs](../web/CONTRIBUTING.md) | [Mobile App Docs](../mobile/CONTRIBUTING.md)

---

This document provides guidelines for developers who want to contribute to the Arcadeum backend API.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [Development Setup](#development-setup)
- [Code Style & Conventions](#code-style--conventions)
- [Testing](#testing)
- [Security & Authentication](#security--authentication)
- [Deployment](#deployment)

---

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- MongoDB (running locally or via cloud)

### First-Time Setup

```bash
# Clone the repository
git clone <repository-url>
cd arcadeum/apps/be

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

---

## Project Architecture

### Tech Stack

| Layer          | Technology             |
| -------------- | ---------------------- |
| Framework      | NestJS                 |
| Language       | TypeScript             |
| Database       | MongoDB + Mongoose     |
| Validation     | class-validator        |
| Authentication | Passport + JWT + OAuth |
| Documentation  | Swagger (OpenAPI)      |

### Directory Structure

```
apps/be/
├── src/
│   ├── main.ts                       # Entry point
│   ├── app.module.ts                 # Root module
│   ├── auth/                         # Authentication & Authorization
│   ├── users/                        # User management
│   ├── games/                        # Game logic & room management
│   ├── chat/                         # Chat functionality
│   ├── database/                     # Database configuration
│   └── common/                       # Shared utilities, filters, guards
├── test/                             # E2E tests
└── ...                               # Config files
```

---

## Development Setup

### Environment Configuration

Create a `.env` file in `apps/be/`:

```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/arcadeum
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
```

### Starting Development

```bash
# Start in watch mode
$ pnpm --filter be start:dev
```

---

## Code Style & Conventions

We follow the standard NestJS and TypeScript best practices.

- Use **Modules** for feature encapsulation.
- Use **Controllers** for handling HTTP requests.
- Use **Services** for business logic.
- Use **DTOs** (Data Transfer Objects) for data validation.
- Use **Interfaces** for type safety.

---

## Testing

### Running Tests

```bash
# Run unit tests
$ pnpm --filter be test

# Run E2E tests
$ pnpm --filter be test:e2e

# Get test coverage
$ pnpm --filter be test:cov
```

---

## Security & Authentication

Please refer to [SECURITY.md](./SECURITY.md) for detailed information on security practices, authentication flows, and data hardening.

---

## Pull Request Guidelines

Please refer to the [General Contributing Guidelines](../../CONTRIBUTING.md) for branch naming, commit messages, and PR requirements.

In addition for the Backend API:

1. **API Documentation**: Update Swagger decorators if API endpoints change.
2. **Database Migrations**: Document any schema changes.
3. **Validation**: Ensure all input data is properly validated using DTOs and `class-validator`.
4. **Error Handling**: Use consistent error formats and status codes.

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

Thank you for contributing to the Arcadeum Backend! 🎮
