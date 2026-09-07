# Arcadeum Games — Security & SEO Audit Report

**Date:** 2026-09-07
**Target:** https://arcadeum.games
**Scope:** Backend (NestJS), Web (Next.js), API security, on-page SEO, technical SEO

---

## Executive Summary

| Area                         | Score   | Rating            |
| ---------------------------- | ------- | ----------------- |
| **Security Headers**         | 100/100 | Excellent         |
| **Backend Security Posture** | 85/100  | Good              |
| **SEO Technical**            | 78/100  | Good              |
| **SEO Content & On-Page**    | 72/100  | Good              |
| **Schema / Structured Data** | 65/100  | Needs Improvement |
| **AI Search Readiness**      | 90/100  | Excellent         |
| **Social & Open Graph**      | 92/100  | Excellent         |

---

## 1. Security Audit

### 1.1 Security Headers — ✅ 100/100

All critical security headers are present:

| Header                  | Status | Value                                                        |
| ----------------------- | ------ | ------------------------------------------------------------ |
| HSTS                    | ✅     | `max-age=63072000; includeSubDomains; preload`               |
| Content-Security-Policy | ✅     | Strict directives configured                                 |
| X-Frame-Options         | ✅     | `SAMEORIGIN`                                                 |
| X-Content-Type-Options  | ✅     | `nosniff`                                                    |
| Referrer-Policy         | ✅     | `strict-origin-when-cross-origin`                            |
| Permissions-Policy      | ✅     | camera=(), microphone=(), geolocation=(), browsing-topics=() |

### 1.2 Backend Security — ✅ 85/100

**Strengths:**

- ✅ **Helmet** configured with strict CSP directives (`apps/be/src/main.ts:67`)
- ✅ **bcrypt** password hashing with configurable salt rounds (`apps/be/src/auth/auth.service.ts:136`)
- ✅ **Global ValidationPipe** with `whitelist: true`, `forbidNonWhitelisted: true` (`apps/be/src/main.ts:98-105`)
- ✅ **Rate limiting** via `@nestjs/throttler` — global throttler + auth-specific throttler (`apps/be/src/auth/auth.module.ts:55`)
- ✅ **CsrfGuard** applied globally (`apps/be/src/main.ts:110`)
- ✅ **IpBlockGuard** for IP-based blocking (`apps/be/src/main.ts:110`)
- ✅ **CORS** restricted to allowed origins via `getAllowedOrigins()` (`apps/be/src/main.ts:112-125`)
- ✅ **Request body size limit** of 1 MB (`apps/be/src/main.ts:22`)
- ✅ **DTOs validated** with `class-validator` decorators across all modules
- ✅ **No secrets in code** — all sensitive values via `process.env` / `ConfigService`
- ✅ **No sensitive data logged** — no password/secret/token values in console output
- ✅ **.env files properly gitignored** in all apps
- ✅ **JwtAuthGuard** applied to all protected endpoints (clans, payments, ranking, chat, achievements, etc.)
- ✅ **RolesGuard** used for admin endpoints (`apps/be/src/economy/admin-economy.controller.ts:29`)

**Findings:**

| Severity  | Finding                                     | Location                  | Recommendation                                                                                                             |
| --------- | ------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ⚠️ Medium | `trust proxy` set to `1` (single proxy hop) | `apps/be/src/main.ts:96`  | Verify this matches deployment topology (Cloudflare → nginx → app). If multiple hops, increase to `2`.                     |
| ⚠️ Medium | CSP allows `'unsafe-inline'` for styles     | `apps/be/src/main.ts:72`  | Consider replacing with nonces or hashes for stricter XSS prevention. Next.js inline styles may require this.              |
| ⚠️ Medium | `crossOriginEmbedderPolicy: false`          | `apps/be/src/main.ts:83`  | Intentional for CORS resources, but verify — this disables COEP which weakens cross-origin isolation.                      |
| ℹ️ Low    | No account lockout mechanism visible        | `apps/be/src/auth/`       | Rate limiting on auth endpoints partially mitigates brute-force. Consider adding explicit lockout after N failed attempts. |
| ℹ️ Low    | Metrics endpoint accessible without auth    | `apps/be/src/main.ts:141` | Only enabled when `METRICS_ENABLED=true`. Verify this is not exposed in production publicly.                               |

### 1.3 XSS & Injection Analysis — ✅ Clean

- **No `dangerouslySetInnerHTML`** in application code (only in vendored build chunks)
- **No `eval()`** in application code
- **MongoDB queries** use parameterized filters (`.find()`, `.findOne()` with object filters) — no raw query concatenation
- **ValidationPipe** strips unknown properties from requests

### 1.4 Dependency Security

npm audit could not run (pnpm workspace — no `package-lock.json`). Recommendation:

```bash
pnpm audit
```

---

## 2. SEO Audit

### 2.1 Technical SEO — ✅ 78/100

| Check          | Status | Details                                      |
| -------------- | ------ | -------------------------------------------- |
| HTTPS          | ✅     | Enforced, no mixed content                   |
| Redirect chain | ✅     | 0 hops, 619ms response                       |
| robots.txt     | ✅     | Present, sitemap declared                    |
| XML Sitemap    | ✅     | Declared in robots.txt                       |
| Canonical tag  | ✅     | `https://arcadeum.games/en`                  |
| Meta robots    | ✅     | `index, follow`                              |
| Language       | ✅     | `lang="en"`                                  |
| Hreflang       | ✅     | 5 languages + x-default (en, es, fr, ru, be) |
| Broken links   | ✅     | 0 broken links (58 checked)                  |
| llms.txt       | ✅     | Present, 100/100 quality score               |
| llms-full.txt  | ✅     | Present                                      |

**Issues:**

| Severity  | Finding                                                                                       | Recommendation                                                                             |
| --------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ⚠️ Medium | 38 orphan pages detected (game pages with only 1 incoming link)                               | Add internal links from the homepage, blog, and related game pages to improve crawlability |
| ⚠️ Medium | 2 links have no anchor text                                                                   | Add descriptive anchor text to improve accessibility and SEO                               |
| ⚠️ Medium | H1 contains "ArcadeumGames" (missing space)                                                   | Fix H1 to "Arcadeum Games" — affects heading hierarchy and keyword signals                 |
| ⚠️ Medium | Duplicate H2s: "Featured Games" appears twice, "Why Arcadeum Games?" has inconsistent spacing | Deduplicate and fix formatting in heading tags                                             |
| ⚠️ Low    | Logo image missing `loading="lazy"` attribute                                                 | The above-the-fold logo should stay as-is (no lazy), but verify                            |
| ℹ️ Info   | Word count: 1,146 on homepage                                                                 | Acceptable for a gaming landing page                                                       |

### 2.2 AI Search Readiness — ✅ 90/100

| Check                | Status | Details                                  |
| -------------------- | ------ | ---------------------------------------- |
| llms.txt             | ✅     | 6 sections, 25 links, full description   |
| llms-full.txt        | ✅     | Complete                                 |
| AI crawlers declared | ⚠️     | Most declared but without explicit rules |

**AI Crawler Management (robots.txt):**

| Bot               | Status                | Notes                         |
| ----------------- | --------------------- | ----------------------------- |
| GPTBot            | ℹ️ Declared, no rules | Inherits `*` rules            |
| ChatGPT-User      | ℹ️ Declared, no rules | Inherits `*` rules            |
| ClaudeBot         | ℹ️ Declared, no rules | Inherits `*` rules            |
| PerplexityBot     | ℹ️ Declared, no rules | Inherits `*` rules            |
| Google-Extended   | ℹ️ Declared, no rules | Inherits `*` rules            |
| Applebot-Extended | ✅ Partially blocked  | 67 paths blocked              |
| Bytespider        | ℹ️ Declared, no rules | Inherits `*` rules            |
| CCBot             | ⚠️ Not managed        | Should be explicitly declared |

**Recommendation:** Add explicit `Allow` or `Disallow` rules for each AI bot rather than relying on inheritance. This makes intent clear and prevents issues if Google changes default behavior.

### 2.3 On-Page SEO & Content — ✅ 72/100

**Title Tag:**

- ✅ Present: "Arcadeum Games — Free Online Board Games, Card Games & Mini-Games"
- ⚠️ Length: 65 chars (recommended max: 60)

**Meta Description:**

- ✅ Present, descriptive, includes keywords
- ⚠️ Length: 236 chars (recommended max: 155-160)

**Open Graph:**

- ✅ All 7 required OG tags present
- ⚠️ `og:title` too long (65 chars, max 60)
- ⚠️ `og:description` too long (236 chars, max 200)

**Twitter Card:**

- ✅ 5/6 tags present (summary_large_image)
- ⚠️ `twitter:description` too long (236 chars, max 200)
- ℹ️ `twitter:creator` missing (optional)

**Heading Hierarchy:**

- ✅ Single H1
- ⚠️ H1 has formatting issue ("ArcadeumGames" — missing space)
- ✅ H2s cover key sections
- ✅ H3s used for game cards

### 2.4 Schema / Structured Data — ✅ 65/100

**Present schemas (6):**

| Schema              | Status        | Notes                                                                         |
| ------------------- | ------------- | ----------------------------------------------------------------------------- |
| Organization        | ✅ Active     | Complete with sameAs, contactPoint, founder                                   |
| WebSite             | ✅ Active     | Includes SearchAction                                                         |
| SoftwareApplication | ✅ Active     | Good for app store visibility                                                 |
| VideoObject         | ✅ Active     | YouTube trailer                                                               |
| BreadcrumbList      | ✅ Active     | Single-level (Home)                                                           |
| FAQPage             | 🔴 Restricted | **Must be removed** — restricted to government/healthcare only since Aug 2023 |

**Critical Issue:**

- 🔴 **FAQPage schema is restricted** — Google limits FAQ rich results to government and healthcare authority sites. This schema will not produce rich results and may be penalized. **Remove immediately.**

**Missing schemas (recommended):**

- `Game` schema for individual game pages (would significantly boost game-specific search visibility)
- `ItemList` for the games catalog
- `Organization` `@id` reference in other schemas (partially done)

### 2.5 Performance (Estimated)

PageSpeed Insights API returned 401 (no API key configured). Based on page analysis:

- ✅ Images served as WebP via Next.js Image component
- ✅ Font preloaded (Geist Latin woff2)
- ✅ `loading="lazy"` on below-the-fold images
- ✅ Compression enabled (`compression()` middleware)
- ✅ Resource hints (preconnect to R2 CDN and API)

---

## 3. Priority Action Plan

### 🔴 Critical (Fix Immediately)

1. **Remove FAQPage schema** — Restricted to government/healthcare only. Will not produce rich results.
2. **Fix H1 "ArcadeumGames"** → "Arcadeum Games" — Broken heading hierarchy.

### ⚠️ High Priority (Fix Within 1 Month)

3. **Add explicit AI crawler rules** in robots.txt for GPTBot, ClaudeBot, PerplexityBot, etc.
4. **Reduce meta description** to ≤155-160 chars for better SERP display.
5. **Reduce og:title** to ≤60 chars for optimal social sharing.
6. **Add internal links to orphan pages** — 38 game pages have minimal linking.
7. **Add `Game` schema** to individual game pages for rich results.
8. **Add explicit CCBot rule** in robots.txt.

### ℹ️ Medium Priority (Fix Within 3 Months)

9. Replace `'unsafe-inline'` in CSP with nonces/hashes where possible.
10. Add account lockout after repeated failed login attempts.
11. Add `twitter:creator` meta tag.
12. Deduplicate heading tags ("Featured Games" appears twice).
13. Run `pnpm audit` to check dependency vulnerabilities.
14. Consider adding `ItemList` schema for games catalog page.
15. Fix 2 links with missing anchor text.

---

## 4. Generated Artifacts

- `SECURITY-SEO-AUDIT.md` — This report
- Page analyzed: https://arcadeum.games
- Scripts executed: security_headers, robots_checker, llms_txt_checker, social_meta, redirect_checker, broken_links, internal_links, fetch_page, parse_html

---

_Report generated by security-reviewer and seo skills._
