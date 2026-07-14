---
name: secure-code-guardian
description: Implement authentication/authorization, secure user input, and prevent OWASP Top 10 vulnerabilities. Use when hashing passwords, sanitizing queries, configuring CORS/CSP, validating input, or setting up JWT tokens. Trigger on keywords like security, authentication, authorization, OWASP, vulnerability, JWT, OAuth, password, encryption.
---

# Secure Code Guardian

## When to Use

- Implementing authentication/authorization
- Securing user input
- Preventing OWASP Top 10 vulnerabilities
- Hashing passwords with bcrypt/argon2
- Configuring CORS/CSP headers
- Setting up JWT tokens

## Core Workflow

1. **Threat model** — Identify attack surface and threats
2. **Design** — Plan security controls
3. **Implement** — Write secure code with defense in depth
4. **Validate** — Test security controls
5. **Document** — Record security decisions

## Code Examples

### Password Hashing (bcrypt)

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
```

### Input Validation with Zod

```typescript
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

export function validateLoginInput(raw: unknown) {
  const result = LoginSchema.safeParse(raw);
  if (!result.success) {
    throw new Error('Invalid credentials format');
  }
  return result.data;
}
```

### JWT Validation

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyToken(token: string): jwt.JwtPayload {
  const payload = jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'arcadeum',
    audience: 'arcadeum',
  });
  if (typeof payload === 'string') throw new Error('Invalid token payload');
  return payload;
}
```

### Rate Limiting

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Throttle(5, 60) // 5 requests per 60 seconds
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // ...
  }
}
```

## Constraints

### MUST DO
- Hash passwords with bcrypt/argon2 (never MD5/SHA-1)
- Use parameterized queries (never string-interpolated SQL)
- Validate and sanitize all user input
- Implement rate limiting on auth endpoints
- Set security headers (CSP, HSTS, X-Frame-Options)
- Log security events
- Store secrets in environment variables

### MUST NOT DO
- Store passwords in plaintext
- Trust user input without validation
- Expose sensitive data in logs or error responses
- Use weak algorithms (MD5, SHA-1, DES)
- Hardcode secrets or credentials

## NestJS Security Patterns

### Auth Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
```

### Role Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Input Sanitization

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value === 'string') {
      // Remove potential XSS
      return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
    return value;
  }
}
```

## OWASP Top 10 Prevention

| Vulnerability | Prevention |
|---------------|------------|
| Injection | Parameterized queries, input validation |
| Broken Auth | bcrypt, JWT with short expiry, rate limiting |
| Sensitive Data | Encrypt at rest, HTTPS only, no logging secrets |
| XXE | Disable XML parsing or use safe parsers |
| Broken Access Control | Role-based guards, ownership checks |
| Security Misconfiguration | Security headers, remove defaults |
| XSS | Output encoding, CSP headers |
| Insecure Deserialization | Validate input types, allowlists |
| Using Components | Keep dependencies updated |
| Insufficient Logging | Log auth events, monitor anomalies |
