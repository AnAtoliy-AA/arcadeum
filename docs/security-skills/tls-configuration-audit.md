# TLS Configuration Audit

Based on MITRE ATT&CK T1557, T1040 and NIST CSF PR.DS-01.

## When to Use

- Before deployment to production
- When configuring reverse proxies (nginx, Cloudflare)
- During security audits

## Checklist

### TLS Version

- [ ] TLS 1.3 supported and preferred
- [ ] TLS 1.2 supported for compatibility
- [ ] TLS 1.0 and 1.1 disabled

### Cipher Suites

```
# Preferred (TLS 1.3)
TLS_AES_256_GCM_SHA384
TLS_AES_128_GCM_SHA256
TLS_CHACHA20_POLY1305_SHA256

# Acceptable (TLS 1.2)
ECDHE-ECDSA-AES256-GCM-SHA384
ECDHE-RSA-AES256-GCM-SHA384
ECDHE-ECDSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-GCM-SHA256
```

### Certificate

- [ ] Valid certificate chain
- [ ] Certificate not expired
- [ ] Strong key (RSA >= 2048 or ECDSA P-256+)
- [ ] OCSP stapling enabled
- [ ] Certificate transparency logged

### Headers

- [ ] HSTS: `max-age=31536000; includeSubDomains; preload`
- [ ] HTTP → HTTPS redirect

## Quick Scan

```bash
# Check TLS versions supported
nmap --script ssl-enum-ciphers -p 443 target.com

# Check certificate details
openssl s_client -connect target.com:443 -servername target.com < /dev/null 2>/dev/null | openssl x509 -noout -dates -subject -issuer

# Test with testssl.sh
testssl.sh target.com

# Check HSTS
curl -sI https://target.com/ | grep -i strict-transport
```

## Nginx Configuration

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_ecdh_curve X25519:secp256r1;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

## References

- Source: Anthropic-Cybersecurity-Skills `configuring-tls-1-3-for-secure-communications`
- Mozilla SSL Config Generator: https://ssl-config.mozilla.org/
