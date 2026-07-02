# Mobile Security Audit (React Native / Expo)

Based on OWASP MASTG, MITRE ATT&CK T1426, T1409, T1417.

## When to Use

- Before releasing mobile app builds
- When investigating mobile-specific vulnerabilities
- During compliance assessments (OWASP MASVS)

## Workflow

### Step 1: Static Analysis

```bash
# Decompile Android APK
jadx -d output/ target.apk

# Search for hardcoded secrets
grep -rn "api_key\|password\|secret\|token\|aws_" output/ --include="*.java" --include="*.kt"

# Check AndroidManifest.xml for exported components
grep -A2 "exported=\"true\"" output/AndroidManifest.xml

# Check for insecure WebView configurations
grep -rn "setJavaScriptEnabled\|addJavascriptInterface" output/ --include="*.java"
```

### Step 2: Network Security Testing

- [ ] Certificate pinning implemented (or validate via Burp proxy)
- [ ] All API calls use HTTPS
- [ ] No sensitive data in URL parameters
- [ ] TLS 1.2+ enforced

### Step 3: Data Storage Analysis

```bash
# Check for insecure storage (Android)
# SharedPreferences: /data/data/com.app/shared_prefs/
# SQLite: /data/data/com.app/databases/
# Logs: adb logcat | grep -i "password\|token\|key"
```

- [ ] No sensitive data in SharedPreferences/NSUserDefaults
- [ ] Keychain/Keystore used for credentials
- [ ] No sensitive data in application logs
- [ ] Backup disabled (`android:allowBackup="false"`)
- [ ] No sensitive data in clipboard

### Step 4: Authentication & Session

- [ ] Biometric auth tied to Keystore/Secure Enclave (not just callback)
- [ ] Tokens stored in Keychain/Keystore, not AsyncStorage/files
- [ ] Session timeout enforced
- [ ] Root/jailbreak detection present and tested
- [ ] Deep links validated (no auth bypass)

### Step 5: Runtime Manipulation

- [ ] App detects Frida/instrumentation frameworks
- [ ] Code signing integrity verified
- [ ] Tamper detection implemented
- [ ] Debug flags disabled in production

## Checklist

### Expo/React Native Specific

- [ ] No secrets in `app.config.js` or `app.json` (exposed in bundle)
- [ ] Expo SecureStore used for sensitive data (not AsyncStorage)
- [ ] Deep link schemes validated
- [ ] Push notification tokens handled securely
- [ ] No sensitive data in `__DEV__` mode checks

### OWASP MASVS Compliance

- [ ] MASVS-STORAGE: Secure data storage
- [ ] MASVS-CRYPTO: Cryptography used correctly
- [ ] MASVS-AUTH: Authentication and session management
- [ ] MASVS-NETWORK: Network communication security
- [ ] MASVS-PLATFORM: Platform interaction security
- [ ] MASVS-CODE: Code quality and build security
- [ ] MASVS-RESILIENCE: Reverse engineering and tampering resistance

## Quick Scan

```bash
# Check for AsyncStorage usage (insecure for sensitive data)
grep -rn "AsyncStorage" apps/mobile/ --include="*.ts" --include="*.tsx"

# Check for hardcoded secrets
grep -rn "API_KEY\|SECRET\|PASSWORD\|TOKEN" apps/mobile/ --include="*.ts" --include="*.tsx"

# Check for console.log in production
grep -rn "console\.log" apps/mobile/src/ --include="*.ts" --include="*.tsx"
```

## References

- Source: Anthropic-Cybersecurity-Skills `conducting-mobile-app-penetration-test`
- OWASP MASTG: https://mas.owasp.org/MASTG/
- OWASP MASVS: https://mas.owasp.org/MASVS/
