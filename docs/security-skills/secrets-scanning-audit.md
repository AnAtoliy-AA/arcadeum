# Secrets Scanning Audit

Based on MITRE ATT&CK T1195, T1554 and NIST CSF PR.PS-01.

## When to Use

- Before committing code
- When onboarding new team members
- During security audits
- After suspected credential compromise

## Scan for Leaked Secrets

### 1. Gitleaks (Git History)

```bash
# Scan entire git history
gitleaks detect --source . --report-format json --report-path gitleaks-report.json

# Scan staged changes only
gitleaks protect --staged

# Scan specific commits
gitleaks detect --source . --log-opts="HEAD~10..HEAD"
```

### 2. Trufflehog (Filesystem + Git)

```bash
# Scan filesystem
trufflehog filesystem . --json > trufflehog-report.json

# Scan git repo
trufflehog git file://. --json > trufflehog-git-report.json

# Verify found secrets against live services
trufflehog filesystem . --only-verified
```

### 3. Manual Grep

```bash
# AWS keys
grep -rn "AKIA[0-9A-Z]\{16\}" . --include="*.ts" --include="*.tsx" --include="*.env*"

# Private keys
grep -rn "BEGIN.*PRIVATE KEY" . --include="*.ts" --include="*.pem" --include="*.key"

# Generic secrets
grep -rn "password\s*=\s*['\"]" . --include="*.ts" --include="*.tsx"
grep -rn "secret\s*=\s*['\"]" . --include="*.ts" --include="*.tsx"
grep -rn "api[_-]key\s*=\s*['\"]" . --include="*.ts" --include="*.tsx"

# JWT secrets
grep -rn "JWT_SECRET\|jwt.*secret" . --include="*.ts" --include="*.env*"

# Database credentials
grep -rn "MONGO.*URI\|DATABASE.*URL\|DB.*PASSWORD" . --include="*.ts" --include="*.env*"
```

## Checklist

### Prevention

- [ ] `.gitignore` includes `.env*`, `*.pem`, `*.key`
- [ ] No secrets in source code (use environment variables)
- [ ] Pre-commit hooks configured (gitleaks)
- [ ] CI/CD pipeline scans for secrets

### Environment Variables

- [ ] All secrets in environment variables, not code
- [ ] `.env.local` not committed (gitignored)
- [ ] `.env.example` has placeholder values only
- [ ] Different secrets per environment (dev/staging/prod)

### Secret Rotation

- [ ] Secrets rotated regularly
- [ ] Compromised secrets immediately rotated
- [ ] Old secrets invalidated

## Quick Scan

```bash
# Check for secrets in git history
git log --all --diff-filter=D -- "*.env*" "*.pem" "*.key" 2>/dev/null

# Check for env files that shouldn't be committed
git ls-files | grep -E "\.env$|\.env\.|\.pem$|\.key$"

# Check .gitignore covers secrets
cat .gitignore | grep -E "env|pem|key|secret"
```

## References

- Source: Anthropic-Cybersecurity-Skills `implementing-secrets-scanning-in-ci-cd`
- Gitleaks: https://github.com/gitleaks/gitleaks
- Trufflehog: https://github.com/trufflesecurity/trufflehog
