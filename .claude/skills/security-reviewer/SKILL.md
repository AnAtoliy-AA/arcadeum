---
name: security-reviewer
description: Review code for security vulnerabilities, audit authentication flows, and identify potential attack vectors. Use when reviewing PRs for security issues, auditing auth implementation, or checking for OWASP violations. Trigger on keywords like security review, audit, vulnerability, attack vector, threat model.
---

# Security Reviewer

## When to Use

- Reviewing code for security vulnerabilities
- Auditing authentication/authorization flows
- Identifying potential attack vectors
- Checking for OWASP violations
- Reviewing PRs for security issues

## Security Checklist

### Authentication
- [ ] Passwords hashed with bcrypt/argon2 (not MD5/SHA-1)
- [ ] JWT tokens have short expiry
- [ ] Refresh tokens stored securely (httpOnly cookie)
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts
- [ ] No user enumeration in error messages

### Authorization
- [ ] Role-based access control implemented
- [ ] Ownership checks for resource access
- [ ] No horizontal/vertical privilege escalation
- [ ] API endpoints protected with guards

### Input Validation
- [ ] All user input validated with class-validator/Zod
- [ ] SQL/NoSQL injection prevented
- [ ] XSS prevention (output encoding)
- [ ] File upload validation (type, size)
- [ ] Request size limits

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced
- [ ] Secrets in environment variables (not code)
- [ ] No sensitive data in logs
- [ ] PII handling compliant

### API Security
- [ ] CORS properly configured
- [ ] Security headers set (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting implemented
- [ ] Request timeout configured
- [ ] Error responses don't leak internals

### Dependencies
- [ ] No known vulnerabilities in dependencies
- [ ] Dependencies up to date
- [ ] No unnecessary dependencies

## Common Vulnerabilities to Check

### SQL/NoSQL Injection
```typescript
// BAD
const query = `SELECT * FROM users WHERE id = ${userId}`;
const user = await this.userModel.find({ email: req.body.email });

// GOOD
const user = await this.userModel.find({ email: { $eq: validatedEmail } });
```

### XSS
```tsx
// BAD
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// BAD
{userContent}

// GOOD
// Sanitize on input, escape on output
```

### Insecure Direct Object Reference
```typescript
// BAD - no ownership check
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.service.findById(id);
}

// GOOD - ownership check
@Get(':id')
async findOne(@Param('id') id: string, @Request() req) {
  return this.service.findByIdAndOwner(id, req.user.id);
}
```

### Missing Rate Limiting
```typescript
// BAD - no rate limiting
@Post('login')
async login(@Body() dto: LoginDto) { ... }

// GOOD - rate limited
@Post('login')
@Throttle(5, 60) // 5 attempts per minute
async login(@Body() dto: LoginDto) { ... }
```

## Review Output Format

When reviewing code, provide:

1. **Risk Level**: Critical / High / Medium / Low / Info
2. **Vulnerability**: Clear description
3. **Location**: File and line number
4. **Impact**: What could happen
5. **Fix**: Concrete code suggestion

## NestJS Specific Checks

- Guards applied to protected routes
- ValidationPipe enabled globally
- Helmet configured for security headers
- CORS origins restricted
- JWT secret from environment variables
- No sensitive data in Swagger docs
