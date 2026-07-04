# IDOR Audit (Insecure Direct Object References)

Based on OWASP Top 10 A01:2021 and MITRE ATT&CK T1190.

## When to Use

- After adding endpoints that access resources by ID
- When implementing user-specific data access
- During security audits

## Attacks to Test

### 1. Direct ID Substitution

```bash
# Access another user's data by substituting ID
curl -H "Authorization: Bearer <user_a_token>" \
  https://target/api/users/<user_b_id>/profile

# Test with sequential IDs
for id in 1 2 3 4 5; do
  curl -s -H "Authorization: Bearer <token>" \
    https://target/api/users/$id/profile -w "%{http_code}\n"
done
```

### 2. UUID/Path Traversal

```bash
# Try path traversal
curl -H "Authorization: Bearer <token>" \
  "https://target/api/users/1/../2/profile"

# Try different ID formats
curl -H "Authorization: Bearer <token>" \
  https://target/api/users/1%2F..%2F2/profile
```

### 3. Mass Assignment

```bash
# Add owner_id to request body
curl -X PUT https://target/api/items/<item_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","owner_id":"<other_user_id>"}'
```

## Checklist

### Prevention

- [ ] Server-side ownership check on every resource access
- [ ] Use indirect references (UUIDs, slugs) instead of sequential IDs
- [ ] DTOs don't accept ownership-related fields
- [ ] Database queries filter by authenticated user

### High-Risk Endpoints

- [ ] User profiles and settings
- [ ] Order/transaction history
- [ ] Game save data and progress
- [ ] File uploads and attachments
- [ ] Admin functions

## Quick Scan

```bash
# Find endpoints with ID parameters
grep -rn "@Get.*:id\|@Put.*:id\|@Delete.*:id\|@Patch.*:id" apps/be/src/ --include="*.ts"

# Check for ownership verification
grep -rn "userId\|ownerId\|createdBy\|user.*id" apps/be/src/ --include="*.ts" | head -10

# Check for find-by-id without user filter
grep -rn "findById\|findOne\|findByPk" apps/be/src/ --include="*.ts" | head -10
```

## References

- Source: Anthropic-Cybersecurity-Skills `exploiting-idor-vulnerabilities`
- OWASP: https://owasp.org/www-community/attacks/Insecure_Direct_Object_Reference
