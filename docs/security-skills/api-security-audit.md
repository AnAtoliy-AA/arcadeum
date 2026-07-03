# API Security Audit (NestJS Backend)

Based on OWASP Top 10 and MITRE ATT&CK T1190.

## When to Use

- After adding new API endpoints
- Before deployment to production
- When investigating potential breaches

## Checklist

### Authentication & Authorization

- [ ] All routes use `@UseGuards(JwtAuthGuard)` unless explicitly public
- [ ] No endpoints trust `req.user` without validation
- [ ] Role-based access control enforced on admin endpoints

### Input Validation

- [ ] All DTOs use `class-validator` decorators
- [ ] No raw `req.body` usage without validation
- [ ] File uploads validated for type and size

### Injection Prevention

- [ ] No string concatenation in database queries
- [ ] Mongoose queries use parameterized operations
- [ ] No `eval()`, `Function()`, or dynamic code execution

### Secrets & Config

- [ ] No hardcoded secrets in source code
- [ ] All config via `ConfigService`, not `process.env` directly
- [ ] Environment variables validated at startup (`required-env.ts`)

### Rate Limiting

- [ ] Authentication endpoints have rate limiting
- [ ] API endpoints have reasonable rate limits
- [ ] WebSocket connections authenticated

## Quick Scan

```bash
# Check for direct process.env usage (should use ConfigService)
grep -rn "process\.env\." apps/be/src/ --include="*.ts" | grep -v "ConfigService"

# Check for eval/Function usage
grep -rn "eval(\|Function(" apps/be/src/ --include="*.ts"

# Check for unvalidated DTOs
grep -rn "@Controller" apps/be/src/ --include="*.ts" -A5 | grep -v "UseGuards"
```
