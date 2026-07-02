# Security Skills

Cybersecurity audit skills adapted from [Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) (Apache 2.0). Customized for the Arcadeum stack: NestJS, Next.js, React Native/Expo, Socket.io, MongoDB, JWT auth, pnpm monorepo.

## Skill Catalog

### Authentication & Session

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [jwt-security-audit](./jwt-security-audit.md) | JWT algorithm confusion, none attack, brute force, claim tampering | After auth changes, before production |
| [csrf-audit](./csrf-audit.md) | Cross-Site Request Forgery on state-changing endpoints | After adding POST/PUT/DELETE endpoints |

### API Security

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [api-security-audit](./api-security-audit.md) | NestJS backend OWASP Top 10 basics | After API changes, before deployment |
| [api-owasp-top10-audit](./api-owasp-top10-audit.md) | Full OWASP API Security Top 10 (BOLA, mass assignment, etc.) | Comprehensive API audit |
| [idor-audit](./idor-audit.md) | Insecure Direct Object References | After adding resource-by-ID endpoints |
| [ssrf-audit](./ssrf-audit.md) | Server-Side Request Forgery | After adding URL fetch/webhook features |
| [race-condition-audit](./race-condition-audit.md) | TOCTOU, limit overrun, concurrency flaws | After adding payments, transfers, coupons |

### Web & Frontend

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [web-security-audit](./web-security-audit.md) | Next.js XSS, CSRF, injection basics | After UI changes, before deployment |
| [xss-testing-audit](./xss-testing-audit.md) | Reflected, stored, DOM-based XSS payloads | When user input is rendered in UI |
| [security-headers-audit](./security-headers-audit.md) | CSP, HSTS, X-Frame-Options, cookie flags | Before deployment, after config changes |
| [prototype-pollution-audit](./prototype-pollution-audit.md) | JavaScript prototype pollution → XSS/RCE | After adding deep merge/clone operations |

### Real-Time Communication

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [websocket-security-audit](./websocket-security-audit.md) | Socket.io auth, CSWSH, injection, DoS | After modifying Socket.io handlers |

### Database

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [nosql-injection-audit](./nosql-injection-audit.md) | MongoDB operator injection, auth bypass | After adding new query endpoints |

### Mobile

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [mobile-security-audit](./mobile-security-audit.md) | React Native/Expo OWASP MASTG checklist | Before mobile releases |

### DevSecOps & Supply Chain

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [devsecops-scanning-audit](./devsecops-scanning-audit.md) | CI/CD pipeline: Semgrep, Trivy, ZAP, Gitleaks | Setting up or auditing security gates |
| [supply-chain-npm-audit](./supply-chain-npm-audit.md) | Malicious npm packages, GuardDog, lockfile checks | Before adding dependencies, after advisories |
| [secrets-scanning-audit](./secrets-scanning-audit.md) | Gitleaks, Trufflehog, hardcoded secret detection | Before commits, CI/CD pipeline |
| [env-secrets-audit](./env-secrets-audit.md) | Exposed keys, env var configuration | Before commits, CI/CD pipeline |

### Cryptography & Transport

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [tls-configuration-audit](./tls-configuration-audit.md) | TLS 1.3, cipher suites, HSTS, certificates | Before deployment, proxy configuration |

## Quick Audit

```bash
# Dependency vulnerabilities
pnpm audit --prod

# Hardcoded secrets
grep -rn "API_KEY\|SECRET\|PASSWORD" apps/ --include="*.ts" --include="*.tsx"

# XSS vectors
grep -rn "dangerouslySetInnerHTML\|innerHTML" apps/web/ --include="*.tsx"

# NoSQL injection
grep -rn "\$where\|\$ne\|\$gt" apps/be/src/ --include="*.ts"

# Missing auth guards
grep -rn "@Controller\|@Get\|@Post" apps/be/src/ --include="*.ts" -B2 | grep -v "UseGuards"
```

## Security Posture (Last Audit: 2026-07-02)

| Category | Status | Notes |
|----------|--------|-------|
| Dependencies | ✅ Fixed | `react-server-dom-webpack` and `shell-quote` overridden to patched versions |
| CSP Headers | ✅ Configured | Full CSP in `next.config.ts` with script-src, connect-src, etc. |
| Rate Limiting | ✅ Configured | Auth: 10-30 req/min, Support: 5 req/hr, Global throttler guard |
| Helmet | ✅ Appropriate | CSP disabled on API server (correct — no HTML served), other headers active |
| Socket Encryption | ✅ Secure | Key sent from server via socket at runtime, never bundled in client |
| Secrets | ✅ Clean | No hardcoded secrets in source. `.env.local` is gitignored |
| Input Validation | ✅ Configured | NestJS ValidationPipe with whitelist + forbidNonWhitelisted |
| JWT Security | ⚠️ To Audit | Algorithm allowlisting, token revocation, key rotation |
| WebSocket Security | ⚠️ To Audit | Origin validation, per-message auth, rate limiting |
| Mobile Security | ⚠️ To Audit | OWASP MASTG compliance, certificate pinning |

## Source Attribution

Skills derived from [Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) (817 skills, 29 domains, Apache 2.0). Adapted for the Arcadeum stack.

## License

Apache 2.0 — see [source repository](https://github.com/mukul975/Anthropic-Cybersecurity-Skills).
