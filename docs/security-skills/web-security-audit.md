# Web Security Audit (Next.js Frontend)

Based on OWASP Top 10 and MITRE ATT&CK T1190.

## When to Use

- After adding new pages or components
- Before deployment to production
- When investigating XSS or injection reports

## Checklist

### XSS Prevention

- [ ] No `dangerouslySetInnerHTML` with user input
- [ ] No `innerHTML` assignments
- [ ] User input sanitized before rendering
- [ ] CSP headers configured in `next.config.js`

### Client-Side Security

- [ ] No secrets in `NEXT_PUBLIC_*` env vars (except public keys)
- [ ] Sensitive data not stored in localStorage/sessionStorage
- [ ] Cookies set with `httpOnly`, `secure`, `sameSite` flags

### Authentication

- [ ] OAuth flows use PKCE
- [ ] Tokens refreshed securely
- [ ] Logout invalidates server-side session

### API Calls

- [ ] No credentials in URL query strings
- [ ] CSRF protection on state-changing requests
- [ ] API responses not leaked to client errors

## Quick Scan

```bash
# Check for dangerouslySetInnerHTML
grep -rn "dangerouslySetInnerHTML" apps/web/ --include="*.tsx"

# Check for NEXT_PUBLIC_ vars that shouldn't be public
grep "NEXT_PUBLIC_" apps/web/.env.local | grep -i "secret\|key\|password\|token"

# Check for localStorage usage
grep -rn "localStorage\|sessionStorage" apps/web/src/ --include="*.ts" --include="*.tsx"
```

## CSP Headers

Add to `next.config.js`:

```js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];
```
