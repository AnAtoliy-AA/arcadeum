# Security Policy

## Reporting a Vulnerability

We take all security vulnerabilities seriously. If you believe you've found a security vulnerability in Arcadeum, please report it to us immediately through our responsible disclosure process.

To report a security vulnerability:
1. Please do NOT create a public issue on GitHub
2. Send an email to arcadeum.care@gmail.com with a detailed description of the issue
3. Include steps to reproduce the vulnerability
4. Include any potential impact or exploitation scenarios
5. We will acknowledge your report within 48 hours

## Security Practices

Arcadeum follows industry-standard security practices across all platforms:

### Backend Security (NestJS)
- All API endpoints are protected with JWT authentication using 256-bit secret keys
- Environment variables are managed through secure configuration management with .env files and encrypted secrets
- Input validation and sanitization are implemented at all levels using NestJS decorators and class-validator
- Rate limiting is applied to prevent brute force attacks and DDoS attempts
- All database connections use TLS encryption with certificate validation
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.) are configured in Express middleware
- Sensitive data is encrypted at rest using AES-256-GCM
- Dependency scanning is performed weekly using npm audit and Snyk
- Automated security testing is integrated into CI/CD pipeline

### Web Security (Next.js)
- All API calls from the frontend use HTTPS with certificate pinning
- Content Security Policy (CSP) is configured to restrict script sources and prevent XSS attacks
- CSRF protection is implemented for all state-changing requests
- Secure cookies with HttpOnly and SameSite=Strict flags are used for authentication
- React's built-in XSS protection is leveraged with proper escaping of user inputs
- Next.js security headers are configured with secure defaults
- All external scripts are loaded from trusted sources only
- Sensitive data is not stored in localStorage; instead, secure cookies are used
- Automatic dependency updates are enabled for security patches

### Mobile Security (Expo/React Native)
- **iOS**: 
  - App Transport Security (ATS) enforced with NSAllowsArbitraryLoads=false
  - iOS PrivacyInfo.xcprivacy file documents all data collection practices
  - Secure storage of sensitive data using Keychain Services
  - Code signing and App Store distribution with strict entitlements
  - ProGuard/R8 obfuscation enabled for release builds
- **Android**:
  - Network security configuration with certificate pinning
  - Secure storage of sensitive data using Android Keystore System
  - ProGuard rules applied to obfuscate code and prevent reverse engineering
  - Android App Bundle (AAB) distribution with Play App Signing
  - Strict permissions model with minimal required permissions
- **Cross-platform**:
  - Socket encryption using AES-256-GCM with 256-bit keys for all WebSocket communications
  - Secure storage implementation using expo-secure-store for credentials and tokens
  - Sentry integration for error reporting with PII (Personally Identifiable Information) disabled by default
  - Biometric authentication support for sensitive operations

### Cross-Platform Security
- **Socket Encryption**: All WebSocket communications use AES-256-GCM encryption with a 256-bit key derived from a secure random seed. The encryption key is never stored on the client and is established during secure authentication.
- **Authentication**: OAuth 2.0 with Google Sign-In for user authentication, with refresh token rotation and short-lived access tokens.
- **Data Protection**: All sensitive user data is encrypted at rest and in transit. No sensitive data is stored in plain text.
- **Dependency Management**: All dependencies are scanned weekly using Snyk and npm audit. Vulnerable dependencies are patched within 72 hours of disclosure.
- **Code Quality**: Code reviews are mandatory for all changes. Security reviews are performed for all features handling sensitive data.
- **Compliance**: Arcadeum complies with GDPR, CCPA, and other relevant privacy regulations. We do not sell user data to third parties.

## Supported Versions

We provide security updates for:
- The latest stable version of Arcadeum
- The previous stable version (for a limited time)

## Response Timeline

We aim to respond to all security reports within:
- 48 hours: Acknowledgement of receipt
- 7 days: Initial assessment and triage
- 14 days: Provide update on remediation timeline
- 30 days: Provide fix or workaround (if feasible)

## Disclosure Policy

We follow responsible disclosure practices:
- We will not take legal action against researchers who report vulnerabilities in good faith
- We will work with researchers to verify and fix vulnerabilities before public disclosure
- We will credit researchers in our release notes when vulnerabilities are fixed
- We will not publish details of vulnerabilities without the reporter's consent

## Security Features in Detail

### Socket Encryption
All WebSocket connections between clients and the backend use AES-256-GCM encryption. The encryption key is established during the authentication handshake using a secure key exchange protocol. The key is never stored on the client device and is regenerated with each session.

### Secure Storage
- **Mobile**: Uses expo-secure-store which leverages iOS Keychain and Android Keystore System
- **Web**: Uses HttpOnly, Secure, SameSite=Strict cookies for authentication tokens
- **Backend**: Sensitive data is encrypted using AES-256-GCM with keys managed by AWS KMS

### Data Collection Transparency
- We collect minimal user data necessary for service functionality
- All data collection is documented in our Privacy Policy
- iOS PrivacyInfo.xcprivacy file complies with Apple's requirements
- Android apps declare all required permissions in AndroidManifest.xml
- No tracking or advertising identifiers are collected

### Security Headers
All web responses include the following security headers:
- Content-Security-Policy: default-src 'self'; script-src 'self' https://*.google.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Referrer-Policy: strict-origin-when-cross-origin

## Contact

For security-related inquiries, please contact: arcadeum.care@gmail.com

*Last updated: March 9, 2026*
