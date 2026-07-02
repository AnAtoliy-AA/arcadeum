# API Security Testing (OWASP API Top 10)

Based on OWASP API Security Top 10 2023 and MITRE ATT&CK T1190, T1213.

## When to Use

- After adding new API endpoints
- Before deployment to production
- During security audits

## OWASP API Top 10 Checklist

### API1: Broken Object Level Authorization (BOLA/IDOR)

```bash
# Test accessing another user's resources
curl -H "Authorization: Bearer <user_a_token>" \
  https://target/api/users/<user_b_id>/data

# Test with different ID formats
curl -H "Authorization: Bearer <token>" \
  https://target/api/users/1/..../users/2/
```

- [ ] Object ownership verified server-side for every request
- [ ] No IDOR on user-specific endpoints

### API2: Broken Authentication

- [ ] JWT validation on every protected endpoint
- [ ] Token expiration enforced
- [ ] Rate limiting on auth endpoints
- [ ] Password policy enforced

### API3: Broken Object Property Level Authorization

```bash
# Mass assignment - add extra fields
curl -X PUT https://target/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","role":"admin","balance":99999}'
```

- [ ] DTOs whitelist allowed fields
- [ ] No mass assignment of sensitive properties

### API4: Unrestricted Resource Consumption

```bash
# Rate limiting test
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{http_code}" https://target/api/endpoint
done
```

- [ ] Rate limiting on all endpoints
- [ ] Pagination limits enforced
- [ ] File upload size limits

### API5: Broken Function Level Authorization

```bash
# Access admin endpoint with regular user token
curl -H "Authorization: Bearer <regular_user_token>" \
  https://target/api/admin/users
```

- [ ] Admin endpoints protected with role guards
- [ ] Regular users cannot access admin functions

### API6: Unrestricted Access to Sensitive Business Flows

- [ ] Game economy endpoints rate limited
- [ ] Premium features require authorization
- [ ] Bot/automation detection

### API7: Server Side Request Forgery (SSRF)

- [ ] No user-controlled URLs fetched server-side without validation
- [ ] Internal network addresses blocked

### API8: Security Misconfiguration

- [ ] No debug endpoints in production
- [ ] CORS configured correctly
- [ ] Error messages don't leak internals

### API9: Improper Inventory Management

- [ ] Old API versions disabled
- [ ] Undocumented endpoints removed
- [ ] API documentation accurate

### API10: Unsafe Consumption of APIs

- [ ] Third-party API responses validated
- [ ] Timeouts set on external calls
- [ ] Error handling for failed external calls

## Quick Scan

```bash
# Check for unguarded controllers
grep -rn "@Controller\|@Get\|@Post\|@Put\|@Delete\|@Patch" apps/be/src/ --include="*.ts" -B2 | grep -v "UseGuards"

# Check for mass assignment
grep -rn "Object\.assign\|...req\.body\|...dto" apps/be/src/ --include="*.ts"

# Check CORS configuration
grep -rn "cors\|origin" apps/be/src/ --include="*.ts"
```

## References

- Source: Anthropic-Cybersecurity-Skills `conducting-api-security-testing`
- OWASP: https://owasp.org/API-Security/
