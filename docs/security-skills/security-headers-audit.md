# Security Headers Audit

Based on MITRE ATT&CK T1190 and OWASP Secure Headers Project.

## When to Use

- Before deployment to production
- After changing `next.config.ts` headers
- During security audits

## Checklist

### Transport Security

- [ ] HSTS header present: `max-age=31536000; includeSubDomains; preload`
- [ ] HTTP redirects to HTTPS (301/302)
- [ ] All cookies have `Secure` flag

### Content Security Policy

- [ ] CSP header present and enforced (not just report-only)
- [ ] No `unsafe-inline` in `script-src`
- [ ] No `unsafe-eval` in `script-src`
- [ ] No wildcard `*` in script sources
- [ ] `default-src` restricts to `'self'`

### Frame & Click Protection

- [ ] `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`
- [ ] `X-Content-Type-Options: nosniff`

### Other Headers

- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] `X-XSS-Protection: 0` (with strong CSP, legacy header disabled)

### Cookie Security

- [ ] Session cookies: `Secure`, `HttpOnly`, `SameSite=Strict`
- [ ] No sensitive data in cookies without encryption
- [ ] `__Host-` or `__Secure-` prefix used where possible

### Information Disclosure

- [ ] `Server` header removed or genericized
- [ ] `X-Powered-By` header removed
- [ ] No technology version numbers exposed

## Quick Scan

```bash
# Fetch all security headers
curl -s -I https://target/ | grep -iE \
  "(strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|set-cookie)"

# Check CSP for dangerous directives
curl -s -I https://target/ | grep -i "content-security-policy" | tr ';' '\n' | grep -i "unsafe"

# Online scanners
# https://securityheaders.com/?q=target.com
# https://observatory.mozilla.org/analyze/target.com
```

## Next.js Configuration

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'nonce-{random}'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' wss: https:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
];
```

## References

- Source: Anthropic-Cybersecurity-Skills `performing-security-headers-audit`
- OWASP: https://owasp.org/www-project-secure-headers/
