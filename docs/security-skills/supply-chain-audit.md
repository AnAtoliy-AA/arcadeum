# Supply Chain Security Audit

Based on `analyzing-sbom-for-supply-chain-vulnerabilities` from Anthropic-Cybersecurity-Skills.

## When to Use

- After `pnpm install` or dependency updates
- Before releases or deployments
- When investigating security advisories

## Quick Check

```bash
# Check for known vulnerabilities
pnpm audit --prod

# Check for outdated dependencies
pnpm outdated

# Generate SBOM (if needed)
npx @cyclonedx/cyclonedx-npm --output-file sbom.json
```

## Manual Checks

1. **Verify package integrity**: Check `pnpm-lock.yaml` hashes match published packages
2. **Review new dependencies**: Check npm page, GitHub repo, download count, last publish date
3. **Check for typosquatting**: Verify package names aren't close misses of popular packages
4. **Audit transitive deps**: `pnpm why <package>` to see dependency chains

## Red Flags

- Package with few downloads but critical functionality
- Recently transferred ownership
- Dependencies pulling from personal repos instead of orgs
- Packages with postinstall scripts (check `package.json` scripts)

## CI/CD Integration

Add to your pipeline:

```yaml
- name: Security audit
  run: pnpm audit --prod --audit-level=critical
```
