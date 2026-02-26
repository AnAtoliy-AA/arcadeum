<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

---

## [Contributing Guidelines](./CONTRIBUTING.md)

---

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository for the **Arcadeum** API Server.

## Architecture Overview

Arcadeum's backend follows a **modular, scalable game engine architecture** designed to support 200+ games with maximum code reuse and separation of concerns.

### Core Components

```
apps/be/
├── src/
│   ├── games/                  # Game engine architecture
│   │   ├── engines/            # Game-specific logic (isolated)
│   │   │   ├── base/           # Core abstractions
│   │   │   ├── registry/       # Engine registry
│   │   │   ├── critical/       # Critical game engine
│   │   │   ├── texas-holdem/   # Texas Hold'em engine
│   │   │   └── engines.module.ts
│   │   ├── schemas/            # MongoDB schemas
│   │   ├── dtos/               # Data transfer objects
│   │   ├── games.service.facade.ts  # Coordination service
│   │   ├── games.gateway.ts    # WebSocket gateway
│   │   ├── games.controller.ts # HTTP controller
│   │   └── games.module.ts     # Main module
│   ├── auth/                   # Authentication system
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── guards/
│   │   └── strategies/
│   ├── users/                  # User management
│   │   ├── controllers/
│   │   ├── services/
│   │   └── schemas/
│   ├── chat/                   # Chat functionality
│   │   ├── controllers/
│   │   ├── services/
│   │   └── schemas/
│   ├── common/                 # Shared utilities
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── guards/
│   └── main.ts                 # Entry point
└── .env.example                # Environment variables template
```

### Game Engine Architecture

The backend uses a **pluggable game engine system** where each game is a self-contained engine:

- **Separation of Concerns**: Game logic is completely isolated from infrastructure
- **Consistent API**: All games use the same interface
- **Type-Safe**: Full TypeScript support with game-specific types
- **Testable**: Each engine can be tested in isolation
- **Reusable**: Common utilities in base engine class
- **Centralized Registry**: Auto-discovery of all available games

See [Game Engine Architecture](./src/games/ARCHITECTURE.md) for detailed documentation.

## Security & Hardening

See [SECURITY.md](./SECURITY.md) for details on:

- Password hashing (bcrypt)
- JWT access tokens (15m) and planned refresh rotation
- OAuth code exchange (confidential client)
- Recommended rate limiting & brute force protections
- Secret management and roadmap

### Auth Endpoints (Current)

| Endpoint         | Method | Description                                |
| ---------------- | ------ | ------------------------------------------ |
| `/auth/register` | POST   | Register user (email, password)            |
| `/auth/login`    | POST   | Obtain access token                        |
| `/auth/token`    | POST   | OAuth code -> token exchange (Google/OIDC) |
| `/auth/me`       | GET    | Test protected route (Bearer access token) |

### (Upcoming) Refresh Tokens

Planned implementation will introduce:

1. `refresh_token` issued alongside `accessToken` on login.
2. Rotation: each refresh invalidates the previous token.
3. Endpoint: `POST /auth/refresh` returning new pair.
4. Storage: HttpOnly Secure cookie (web) / secure storage (mobile).

### (Upcoming) Password Reset Flow

Skeleton will include:

1. `POST /auth/password/request` (email) – issues time-bound reset token.
2. `POST /auth/password/reset` (token, newPassword) – validates & updates hash.
3. Token format: signed, short-lived (e.g., 15–30 min) or DB persisted hashed token.

Refer to SECURITY.md for more context and roadmap details.

## Project Setup

### Prerequisites

- Node.js v18+
- pnpm
- MongoDB (local or cloud)
- Redis (for rate limiting and caching)

### Installation

Install dependencies from the workspace root:

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in `apps/be/` to configure the server. Common variables:

```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/arcadeum

# JWT configuration
AUTH_JWT_SECRET=your-secret-key
AUTH_JWT_EXPIRATION=15m

# OAuth configuration
AUTH_ISSUER=https://accounts.google.com
AUTH_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
AUTH_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
AUTH_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com

# TBC Payment Gateway (if integrated)
TBC_API_BASE_URL=https://api.tbcbank.ge
TBC_CLIENT_ID=your_client_id
TBC_CLIENT_SECRET=your_client_secret
TBC_API_KEY=your_api_key
TBC_DEFAULT_CURRENCY=GEL

# Redis connection
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development
PORT=4000
```

## Running the Project

```bash
# development - watch mode (recommended for development)
$ pnpm --filter be start:dev

# development - without watch mode
$ pnpm --filter be start

# production mode
$ pnpm --filter be start:prod

# build for production
$ pnpm --filter be build
```

## API Documentation

The backend provides comprehensive API documentation via Swagger:

- Access at `http://localhost:4000/api` when running locally
- Automatic generation from decorators
- Interactive API explorer
- Schema validation documentation

## Running Tests

```bash
# unit tests
$ pnpm --filter be test

# e2e tests
$ pnpm --filter be test:e2e

# test coverage
$ pnpm --filter be test:cov

# watch mode for tests
$ pnpm --filter be test:watch
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

### Recommended Deployment Options

1. **Docker Containerization**:

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN pnpm install --frozen-lockfile
   COPY . .
   RUN pnpm --filter be build
   EXPOSE 4000
   CMD ["pnpm", "--filter", "be", "start:prod"]
   ```

2. **Cloud Platforms**:

   - **AWS**: Deploy as ECS service or Lambda
   - **Google Cloud**: Deploy as Cloud Run service
   - **Azure**: Deploy as App Service
   - **Vercel**: For serverless functions (limited)

3. **Process Management**:
   - Use PM2 for process management in production
   - Configure logging with Winston
   - Set up monitoring with Prometheus and Grafana

### Environment Configuration for Production

```bash
# Production-specific variables
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arcadeum
AUTH_JWT_SECRET=your-production-secret-key
REDIS_URL=redis://your-redis-host:6379
TBC_API_BASE_URL=https://api.tbcbank.ge
```

## Monitoring and Logging

### Logging Strategy

- Use Winston for structured logging
- Log levels: error, warn, info, verbose, debug
- Include request IDs for traceability
- Avoid logging sensitive information (tokens, passwords)

### Monitoring Tools

- **Sentry**: Error tracking
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization
- **New Relic**: Application performance monitoring
- **Datadog**: Comprehensive monitoring

### Health Checks

Implement health check endpoints:

- `/health` - Basic service health
- `/health/db` - Database connection status
- `/health/redis` - Redis connection status
- `/health/external` - External service dependencies

## Performance Optimization

### Database Optimization

- Implement proper indexing for frequently queried fields
- Use connection pooling for MongoDB
- Implement caching with Redis for frequently accessed data
- Use projection to return only required fields
- Implement pagination for large datasets

### API Optimization

- Use compression (gzip) for API responses
- Implement HTTP caching headers
- Optimize API endpoints to reduce round trips
- Use WebSockets for real-time updates instead of polling
- Implement rate limiting to prevent abuse

### Memory Management

- Use streaming for large file uploads/downloads
- Implement proper garbage collection
- Monitor memory usage with process metrics
- Use cluster mode for multi-core systems

## Security Best Practices

### Authentication

- Use JWT with short expiration times (15 minutes)
- Implement refresh token rotation
- Use secure cookies for refresh tokens
- Implement rate limiting for authentication endpoints
- Use HTTPS exclusively in production

### Data Validation

- Validate all input data with class-validator
- Use DTOs for request/response modeling
- Sanitize user input
- Implement input length limits
- Use type-safe interfaces

### Network Security

- Implement CORS policy with trusted origins only
- Use security headers (X-Content-Type-Options, X-Frame-Options, CSP)
- Implement HSTS header
- Use TLS 1.2+ for all connections
- Disable insecure protocols

### Secret Management

- Store secrets in environment variables or secret manager
- Never commit secrets to version control
- Rotate secrets regularly
- Use key rotation for JWT signing keys
- Use different secrets for different environments

## Internationalization (i18n)

- Use type-safe translation keys (see [Translation Type Safety](../../docs/TRANSLATION_TYPE_SAFETY.md))
- Maintain consistent key naming conventions
- Use hierarchical structure for translation keys
- Provide fallback languages for missing translations
- Test translations with different languages and text lengths

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

## Support

For questions or issues with the backend API:

1. Check this documentation first
2. Review existing implementation examples
3. Create an issue with detailed description
4. Include reproduction steps and error logs

Thank you for helping us build Arcadeum! 🎮
