# CSRF Audit (Cross-Site Request Forgery)

Based on OWASP Top 10 A01:2021 and MITRE ATT&CK T1190.

## When to Use

- After adding state-changing API endpoints
- When implementing or modifying authentication
- During security audits

## Attacks to Test

### 1. Forge State-Changing Requests

```html
<!-- Auto-submitting CSRF PoC -->
<form action="https://target/api/account/change-email" method="POST">
  <input type="hidden" name="email" value="attacker@evil.com" />
</form>
<script>document.forms[0].submit();</script>
```

### 2. JSON API CSRF

```html
<!-- CSRF for JSON API using enctype -->
<form action="https://target/api/account/change-email"
      method="POST" enctype="text/plain">
  <input type="hidden"
         name='{"email":"attacker@evil.com","ignore":"'
         value='"}' />
</form>
<script>document.forms[0].submit();</script>
```

### 3. SameSite=Lax Bypass

```html
<!-- Top-level GET navigation bypasses SameSite=Lax -->
<a href="https://target/api/settings?action=disable_2fa">
  Click for prize
</a>
```

## Checklist

### Anti-CSRF Protections

- [ ] CSRF tokens in forms and state-changing requests
- [ ] Custom headers required (X-CSRF-Token, X-Requested-With)
- [ ] SameSite cookie attribute set (Strict or Lax)
- [ ] Origin/Referer header validation

### Token Validation

- [ ] CSRF token present in request
- [ ] Token matches server-side session
- [ ] Token expires after reasonable time
- [ ] Token is per-user and per-session

### Cookie Security

- [ ] Session cookies: `SameSite=Strict` or `SameSite=Lax`
- [ ] No `SameSite=None` without `Secure`
- [ ] `HttpOnly` flag on session cookies

## Quick Scan

```bash
# Check for CSRF token implementation
grep -rn "csrf\|xsrf\|_token\|csrfToken" apps/be/src/ --include="*.ts"

# Check SameSite cookie config
grep -rn "SameSite\|sameSite" apps/be/src/ --include="*.ts"

# Check for state-changing endpoints without CSRF
grep -rn "@Post\|@Put\|@Delete\|@Patch" apps/be/src/ --include="*.ts" -B3 | grep -v -i "csrf\|guard"
```

## References

- Source: Anthropic-Cybersecurity-Skills `performing-csrf-attack-simulation`
- OWASP: https://owasp.org/www-community/attacks/csrf
