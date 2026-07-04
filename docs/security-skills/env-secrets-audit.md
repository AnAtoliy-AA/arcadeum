# Environment & Secrets Audit

Based on `analyzing-supply-chain-malware-artifacts` and MITRE ATT&CK T1552.001.

## When to Use

- Before commits (pre-commit hook)
- Before deployment
- When rotating credentials

## Checklist

### Gitignore Verification

- [ ] `.env` files in `.gitignore`
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in tracked `.env.example` files

### Hardcoded Secrets Scan

```bash
# Scan for common secret patterns
grep -rn "API_KEY\|SECRET\|PASSWORD\|TOKEN\|PRIVATE_KEY" \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  apps/ packages/ | grep -v "node_modules" | grep -v ".d.ts"

# Scan for hardcoded IPs or URLs with credentials
grep -rn "https://[^@]*@" --include="*.ts" apps/

# Scan for base64 encoded secrets
grep -rn "[A-Za-z0-9+/]\{40,\}" --include="*.ts" apps/ | head -20
```

### Environment Variable Security

- [ ] No `NEXT_PUBLIC_` prefix on actual secrets
- [ ] Secrets loaded from secure vault in production (not env files)
- [ ] API keys rotated periodically
- [ ] No secrets in CI/CD logs

### Socket/Encryption Keys

- [ ] Encryption keys not committed to repo
- [ ] Keys rotated if exposed
- [ ] Different keys for dev/staging/production

## Pre-Commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
# Check for secrets in staged files
if git diff --cached --name-only | xargs grep -l "API_KEY\|SECRET\|PASSWORD\|TOKEN" 2>/dev/null; then
  echo "⚠️  Potential secrets detected in staged files!"
  echo "Review before committing."
  exit 1
fi
```
