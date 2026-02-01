# Security Overview

This document summarizes current authentication and security measures in the backend and outlines recommended next steps for hardening.

## Authentication Stack
- Local email/password auth with bcrypt hashing (cost factor 12).
- JWT access tokens (15 minute expiry) issued on successful login.
- Optional OAuth (OIDC) token exchange via `POST /auth/token` using server-side confidential client (protects client secret).

## Password Handling
- Plaintext passwords are never stored.
- Bcrypt cost: 12 (acceptable baseline). Reassess periodically; consider 12–14 depending on hardware and latency targets (<150ms per hash ideally).
- Future enhancement: password complexity validation (length, character classes, rejects common/compromised passwords via HaveIBeenPwned or zxcvbn scoring).

## JWT Tokens
- Signing secret: `AUTH_JWT_SECRET` (environment-specific). Must NOT be committed.
- Access token lifetime: 15 minutes (configured in `JwtModule`).
- Payload fields: `sub` (user id), `email`.
- Rotation / refresh tokens: not yet implemented. Recommended for longer sessions; see "Roadmap".

## OAuth Code Exchange
- Server performs authorization code -> token exchange to avoid exposing `client_secret` in browser/mobile code.
- Discovery document cached for 10 minutes.
- Errors sanitized to avoid leaking internal details.

## Error Messaging & Enumeration
- Login returns generic `Invalid credentials` for invalid email/password.
- Registration currently states `Email already registered` (can optionally be generalized to reduce enumeration risk).

## Rate Limiting & Brute Force (TODO)
Not yet implemented. Recommended strategy:
1. Track failed login attempts keyed by (email + IP) using Redis with TTL.
2. Apply incremental backoff or temporary lock after N failures (e.g., 5 failures -> 5 min lock).
3. Global IP-based rate limit for auth endpoints (e.g., 100 requests / 15 min).

## Refresh Tokens (Roadmap)
Add secure refresh token rotation flow:
- Issue refresh token with longer TTL (e.g., 7 days) and store hashed version server-side.
- Include `jti` claim for revocation tracking.
- Rotate on each refresh; revoke previous.
- Store in HttpOnly Secure SameSite=strict cookie for web, secure storage for mobile.
- Provide `/auth/refresh` endpoint; reject on reuse (replay detection).

## Logging & Monitoring
- Avoid logging passwords or raw tokens. If correlation needed, log last 6 chars of token.
- Consider structured logs with audit trail: login success/fail, password change, refresh, logout (future).
- Integrate alerting on spikes in failed logins or abnormal token issuance volume.

## Sentry / Telemetry
- Ensure scrubbing of Authorization headers and secrets before event transmission.
- Tag auth-related errors with a category (e.g., `auth`) for filtering.

## Transport Security
- Enforce HTTPS in production; redirect HTTP -> HTTPS at load balancer / reverse proxy.
- Add HSTS header `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` after confirming HTTPS readiness.

## Security Headers (Recommended)
Add via middleware / reverse proxy:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`: tailor when serving any dynamic HTML.

## CORS
- Restrict allowed origins to trusted frontend domains in production.
- Allow only required methods and headers; disallow credentials unless using cookie refresh tokens.

## Secret Management
- Keep secrets in environment variables or a secret manager (AWS SM, Vault, etc.).
- Rotate `AUTH_JWT_SECRET` on schedule (e.g., quarterly) or immediately on compromise.
- Future: support multiple signing keys (kid) for zero-downtime rotation.

## Data Protection
- Use TLS for MongoDB in production (if remote).
- Limit MongoDB user privileges to required database.
- Regular encrypted backups with restricted restore privileges.

## Account Lifecycle (Future)
- Implement password reset (time-bound signed token or one-time code).
- Implement change password endpoint (requires current password verification).
- Optional: account deletion / anonymization pathway.
- Optional: MFA (TOTP / WebAuthn) for high-value accounts.

## Threat Mitigation Quick Reference
| Threat | Mitigation (current/planned) |
|--------|------------------------------|
| Password brute force | (Planned) rate limiting + lockouts |
| Token theft (XSS) | Short-lived access tokens; future refresh in HttpOnly cookie |
| Replay of refresh token | (Planned) rotation + jti revocation list |
| User enumeration | Generic login errors; optional generic register errors |
| Credential stuffing | (Planned) IP/email rate limiting; anomaly alerts |
| Secret leakage | Server-side OAuth exchange; env var storage |

## Roadmap Summary
1. Add rate limiting middleware (e.g., Nest + Redis) for `/auth/*` endpoints.
2. Implement refresh token model + `/auth/refresh` route.
3. Add password reset & change password endpoints.
4. Add optional MFA.
5. Introduce structured audit logging and anomaly detection.
6. Implement key rotation with multiple active JWT signing keys.

---
Questions or security review requests can be documented here as issues linking to this file for updates.
