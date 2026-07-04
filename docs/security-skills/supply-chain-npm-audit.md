# Supply Chain Security (npm/pnpm)

Based on MITRE ATT&CK T1195.002 and NIST CSF DE.CM-09.

## When to Use

- Before adding new dependencies
- When investigating suspicious package behavior
- After supply-chain security advisories
- During code review of package.json changes

## Detecting Malicious Packages

### 1. Scan with GuardDog

```bash
pip install guarddog

# Scan a specific package
guarddog npm scan <package-name>

# Scan a specific version
guarddog npm scan <package-name> --version 1.2.3

# Scan full dependency tree
guarddog npm verify package.json

# Focus on high-signal heuristics
guarddog npm scan <package-name> \
  --rules npm-install-script \
  --rules npm-serialize-environment \
  --rules npm-exec-base64 \
  --rules npm-obfuscation \
  --rules typosquatting
```

### 2. Manual Inspection

```bash
# Download without executing
npm pack <package-name>@<version>
tar -xzf <package-name>-<version>.tgz

# Check lifecycle scripts
jq '.scripts' package/package.json

# Hunt for suspicious patterns
grep -rEn "child_process|exec\(|eval\(|Buffer\.from\(.*base64|process\.env|https?://" package/ \
  --include='*.js' --include='*.ts'
```

### 3. Cross-check Lockfiles

```bash
# OSV-Scanner for known-vulnerable/malicious versions
osv-scanner --lockfile=package-lock.json

# Check pnpm lockfile
osv-scanner --lockfile=pnpm-lock.yaml
```

### 4. Dynamic Detonation (Sandbox Only)

```bash
# In disposable container with network monitoring
npm install ./suspect-package.tgz
# Monitor outbound connections
```

## Checklist

### Before Adding Dependencies

- [ ] Package scanned with GuardDog
- [ ] No suspicious install scripts (preinstall/install/postinstall)
- [ ] Package has reasonable download count and maintenance
- [ ] No typosquatting (check exact name spelling)
- [ ] Source code reviewed (not just minified/obfuscated)

### Lockfile Security

- [ ] Lockfile committed to git
- [ ] `pnpm audit --prod` run regularly
- [ ] Known-malicious versions checked against OSV
- [ ] Dependabot/Renovate configured for automated updates

### Install Script Safety

```bash
# Check for install scripts in package.json
cat node_modules/<package>/package.json | jq '.scripts'

# Red flags:
# - preinstall/install/postinstall scripts
# - Scripts that run curl/wget to external URLs
# - Scripts that read process.env or ~/.npmrc
# - Scripts using eval() or child_process
```

## Quick Scan

```bash
# Check for packages with install scripts
find node_modules -name "package.json" -exec jq -r 'select(.scripts.preinstall or .scripts.install or .scripts.postinstall) | .name' {} \;

# Check for suspicious patterns in node_modules
grep -rEn "process\.env|child_process|exec\(" node_modules/ --include="*.js" 2>/dev/null | head -20
```

## References

- Source: Anthropic-Cybersecurity-Skills `detecting-malicious-npm-packages`, `analyzing-sbom-for-supply-chain-vulnerabilities`
- GuardDog: https://github.com/DataDog/guarddog
- OSV-Scanner: https://github.com/google/osv-scanner
