---
name: performance
description: Use when implementing or reviewing frontend performance — bundle optimization, lazy loading, image optimization, caching, Core Web Vitals (LCP, FID/INP, CLS), code splitting, rendering strategies, or any speed/performance task. Trigger on keywords like performance, speed, bundle size, lazy load, Web Vitals, LCP, CLS, INP, cache, optimize, lighthouse, Core Web Vitals.
---

# Performance Skill

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|--------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## Rendering Strategy

Pick the right rendering mode per page:

| Strategy | When | How (Next.js) |
|----------|------|---------------|
| **Static (SSG)** | Content changes infrequently | `export const dynamic = 'force-static'` or default in App Router |
| **ISR** | Content updates periodically | `revalidate: N` in `fetch` or route config |
| **SSR** | Content is user-specific or real-time | `export const dynamic = 'force-dynamic'` or `cookies()`/`headers()` usage |
| **Streaming** | Pages with slow data + fast shell | `loading.tsx` + Suspense boundaries |

Rules:
- Default to static. Only use dynamic rendering when necessary.
- Use Suspense + `loading.tsx` for streaming — show a shell immediately.
- Never block the entire page on a single slow API call.

## Bundle Optimization

```bash
# Analyze bundle
npx @next/bundle-analyzer
```

Rules:
- Import only what you use: `import { debounce } from 'lodash-es'` not `import _ from 'lodash'`.
- Use dynamic imports for heavy, below-the-fold components:
  ```ts
  const HeavyChart = dynamic(() => import('./HeavyChart'), { loading: () => <Skeleton /> })
  ```
- Check bundle size before merging: `pnpm build` + analyze.
- Avoid barrel exports (`export * from`) in shared packages — they prevent tree-shaking.
- Prefer native browser APIs over polyfills (e.g., `fetch`, `URL`, `structuredClone`).

## Image Optimization

```html
<!-- Next.js: always use next/image -->
<Image
  src="/hero.webp"
  alt="Descriptive text"
  width={1200}
  height={630}
  priority          // for above-the-fold / LCP images
  placeholder="blur"
  blurDataURL={blurHash}
/>

<!-- Below the fold: lazy loaded by default -->
<Image src="/thumbnail.webp" alt="..." width={400} height={300} />
```

Rules:
- Use `next/image` for automatic WebP/AVIF conversion, resizing, and lazy loading.
- Set `priority` on the LCP image (hero, main visual). Never lazy-load LCP.
- Always specify `width` and `height` to prevent CLS.
- Use responsive `sizes` prop for different viewport breakpoints.
- Serve modern formats (WebP, AVIF) with automatic fallbacks.

## Font Optimization

```ts
// next/font — zero layout shift, automatic subsetting
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // FOUT over FOIT — show fallback immediately
})
```

Rules:
- Use `next/font` (self-hosted, no external requests to Google Fonts).
- `display: 'swap'` — text is visible immediately with fallback font.
- Preload critical fonts: `<link rel="preload" as="font" ...>`.
- Limit font variations (weight, style) to what's actually used.

## Caching

```ts
// Server: cache fetch responses
const data = await fetch(url, { next: { revalidate: 3600 } }) // ISR: 1 hour

// Client: use React cache or SWR/React Query
import { cache } from 'react'
const getCachedUser = cache(async (id: string) => { ... })
```

Headers:
- `Cache-Control: public, max-age=31536000, immutable` — hashed assets.
- `Cache-Control: public, s-maxage=86400, stale-while-revalidate=86400` — static pages.
- `Cache-Control: no-store` — truly dynamic, personalized content.

Rules:
- Static assets with content hashes → long cache + immutable.
- HTML pages → shorter cache + stale-while-revalidate for freshness.
- API responses → appropriate `Cache-Control` or `CDN-Cache-Control`.

## Code Splitting & Lazy Loading

```ts
// Route-based splitting (automatic in App Router)
// app/dashboard/page.tsx — separate chunk from app/settings/page.tsx

// Component-level splitting
const BelowFoldSection = dynamic(() => import('./BelowFoldSection'), {
  loading: () => <SectionSkeleton />,
})

// Intersection Observer for non-JS triggering
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      loadAnalytics()
      observer.disconnect()
    }
  }, { threshold: 0.1 })
  observer.observe(ref.current)
}, [])
```

## Third-Party Scripts

```html
<!-- defer/async for non-critical scripts -->
<script src="analytics.js" defer></script>

<!-- Lazy load with Intersection Observer or user interaction -->
<script>
  // Load on first interaction
  window.addEventListener('scroll', () => { loadChatWidget() }, { once: true })
</script>

<!-- Use next/script for third-party scripts -->
<Script src="https://analytics.example.com/script.js" strategy="lazyOnload" />
```

Rules:
- Never block rendering with third-party scripts.
- Use `strategy="afterInteractive"` or `strategy="lazyOnload"` in Next.js.
- Self-host third-party scripts when possible (eliminates DNS + TLS round trips).
- Audit: no more than 2 render-blocking resources.

## CSS Optimization

- Critical CSS inline in `<head>` (Next.js does this automatically).
- Avoid large CSS-in-JS runtime costs — prefer CSS Modules, Tailwind, or static extraction.
- Remove unused CSS: use PurgeCSS / Tailwind's built-in purging.
- Use `content-visibility: auto` for off-screen sections to skip rendering work.

## Monitoring & Measurement

```bash
# Lighthouse CI
npx lighthouse https://example.com --output=json --output-path=./lh-report.json

# Core Web Vitals in production
# Use web-vitals library
import { onLCP, onINP, onCLS } from 'web-vitals'
onLCP(console.log)
onINP(console.log)
onCLS(console.log)
```

Rules:
- Run Lighthouse before every release (target: Performance ≥ 90).
- Monitor CrUX / RUM data in production.
- Set up alerts for regressions in LCP, INP, CLS.

## Performance Checklist

- [ ] Lighthouse Performance score ≥ 90
- [ ] LCP ≤ 2.5s (LCP element identified, preloaded if needed)
- [ ] INP ≤ 200ms (no long tasks blocking main thread)
- [ ] CLS ≤ 0.1 (all media has dimensions, no dynamic content injection above fold)
- [ ] Images use `next/image` with explicit width/height
- [ ] Fonts self-hosted via `next/font` with `display: swap`
- [ ] No render-blocking third-party scripts
- [ ] Bundle analyzed — no unexpected large dependencies
- [ ] Dynamic imports for below-the-fold heavy components
- [ ] Static rendering used where possible
- [ ] Appropriate cache headers set
- [ ] No layout shift from ads, embeds, or dynamically loaded content
