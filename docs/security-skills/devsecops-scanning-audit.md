# DevSecOps Security Scanning

Based on MITRE ATT&CK T1078, T1190, T1610 and OWASP DevSecOps Guideline.

## When to Use

- Setting up CI/CD security scanning
- When adding new security gates to the pipeline
- Before major releases

## Pipeline Architecture

```
pre-commit → PR checks → merge → build → deploy
   │            │                      │
   │     ┌──────┴──────┐         ┌────┴────┐
   │     │  Gitleaks    │         │  Trivy  │
   │     │  Semgrep     │         │  ZAP    │
   │     │  Trivy SCA   │         └─────────┘
   │     └──────────────┘
```

## Step 1: Secrets Detection (Gitleaks)

```yaml
# .github/workflows/security.yml
secrets-scan:
  name: Secrets Detection
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

```toml
# .gitleaks.toml
[extend]
useDefault = true

[allowlist]
paths = [
  '''\.gitleaks\.toml''',
  '''test/fixtures/.*''',
]
```

## Step 2: SAST with Semgrep

```yaml
  sast-scan:
    name: SAST (Semgrep)
    runs-on: ubuntu-latest
    container:
      image: semgrep/semgrep
    steps:
      - uses: actions/checkout@v4
      - run: |
          semgrep scan \
            --config p/security-audit \
            --config p/owasp-top-ten \
            --severity ERROR \
            --error \
            --json --output semgrep-results.json \
            .
```

## Step 3: SCA with Trivy

```yaml
  sca-scan:
    name: SCA (Trivy)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@0.28.0
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
```

## Step 4: DAST with OWASP ZAP

```yaml
  dast-scan:
    name: DAST (ZAP)
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    steps:
      - uses: zaproxy/action-baseline@v0.14.0
        with:
          target: ${{ vars.STAGING_URL }}
```

## Step 5: Security Gate

```yaml
  security-gate:
    name: Security Gate
    runs-on: ubuntu-latest
    needs: [secrets-scan, sast-scan, sca-scan]
    if: always()
    steps:
      - run: |
          if [[ "${{ needs.secrets-scan.result }}" == "failure" ]]; then
            echo "BLOCKED: Secrets detected"; exit 1
          fi
          if [[ "${{ needs.sast-scan.result }}" == "failure" ]]; then
            echo "BLOCKED: SAST critical findings"; exit 1
          fi
          if [[ "${{ needs.sca-scan.result }}" == "failure" ]]; then
            echo "BLOCKED: Vulnerable dependencies"; exit 1
          fi
```

## Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.22.1
    hooks:
      - id: gitleaks
  - repo: https://github.com/semgrep/semgrep
    rev: v1.102.0
    hooks:
      - id: semgrep
        args: ['--config', 'p/security-audit', '--error']
```

## Checklist

- [ ] Gitleaks blocks commits with hardcoded secrets
- [ ] Semgrep runs on every PR
- [ ] Trivy detects vulnerable dependencies
- [ ] Security gate blocks merge on critical findings
- [ ] Branch protection enforces required status checks
- [ ] Pre-commit hooks catch issues locally

## References

- Source: Anthropic-Cybersecurity-Skills `implementing-devsecops-security-scanning`
