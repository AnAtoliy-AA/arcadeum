# Security Skills

Cybersecurity audit skills adapted from [Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) (Apache 2.0).

## Relevant Skills for This Repo

| Skill                                         | Purpose                                         | When to Use                           |
| --------------------------------------------- | ----------------------------------------------- | ------------------------------------- |
| [supply-chain-audit](./supply-chain-audit.md) | Check dependencies for known vulnerabilities    | Before releases, after `pnpm install` |
| [api-security-audit](./api-security-audit.md) | Audit NestJS backend for OWASP Top 10           | After API changes, before deployment  |
| [web-security-audit](./web-security-audit.md) | Check Next.js frontend for XSS, CSRF, injection | After UI changes, before deployment   |
| [env-secrets-audit](./env-secrets-audit.md)   | Detect hardcoded secrets and exposed keys       | Before commits, CI/CD pipeline        |

## Quick Audit

```bash
# Run all audits
pnpm audit --prod                          # dependency vulnerabilities
grep -rn "API_KEY\|SECRET\|PASSWORD" apps/ # hardcoded secrets
```

## Security Posture (Last Audit: 2026-07-02)

| Category          | Status         | Notes                                                                       |
| ----------------- | -------------- | --------------------------------------------------------------------------- |
| Dependencies      | ✅ Fixed       | `react-server-dom-webpack` and `shell-quote` overridden to patched versions |
| CSP Headers       | ✅ Configured  | Full CSP in `next.config.ts` with script-src, connect-src, etc.             |
| Rate Limiting     | ✅ Configured  | Auth: 10-30 req/min, Support: 5 req/hr, Global throttler guard              |
| Helmet            | ✅ Appropriate | CSP disabled on API server (correct — no HTML served), other headers active |
| Socket Encryption | ✅ Secure      | Key sent from server via socket at runtime, never bundled in client         |
| Secrets           | ✅ Clean       | No hardcoded secrets in source. `.env.local` is gitignored                  |
| Input Validation  | ✅ Configured  | NestJS ValidationPipe with whitelist + forbidNonWhitelisted                 |

## License

These skills are derived from [Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) under Apache 2.0 license.
