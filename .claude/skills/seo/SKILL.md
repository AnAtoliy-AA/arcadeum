---
name: seo
description: Use when implementing or reviewing SEO best practices — meta tags, structured data, Open Graph, Twitter Cards, semantic HTML, sitemap, robots.txt, image alt text, canonical URLs, or any search-engine-optimization task. Trigger on keywords like SEO, meta, sitemap, structured data, schema.org, Open Graph, canonical, robots.
---

# SEO Skill

## Core Principles

- Every page must have a unique `<title>` and `<meta name="description">`.
- Use semantic HTML elements (`<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`, `<main>`, `<aside>`) over generic `<div>`/`<span>`.
- All images must have descriptive `alt` attributes. Decorative images use `alt=""`.
- Use a single `<h1>` per page; headings must follow logical hierarchy (`h1` → `h2` → `h3`).
- Ensure every page is reachable via internal links (no orphan pages).

## Meta Tags

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title – Site Name</title>
  <meta name="description" content="120–158 chars, include primary keyword naturally." />
  <link rel="canonical" href="https://example.com/canonical-path" />
</head>
```

Rules:
- `title`: 50–60 chars. Primary keyword near the start. Unique per page.
- `description`: 120–158 chars. Include CTA or value proposition. Unique per page.
- `canonical`: Use absolute URL. Self-referencing canonical on every page. Omit on paginated series with `rel="prev"`/`rel="next"`.

## Open Graph (Facebook, LinkedIn, Discord, etc.)

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Concise summary." />
<meta property="og:url" content="https://example.com/path" />
<meta property="og:image" content="https://example.com/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Site Name" />
<meta property="og:locale" content="en_US" />
```

For articles, use `og:type` = `"article"` and add `article:published_time`, `article:modified_time`, `article:author`.

Rules:
- `og:image`: 1200×630 px recommended. Absolute URL. No cached/dynamic URLs.
- `og:url`: canonical URL, no trailing slashes inconsistency.

## Twitter / X Cards

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Concise summary." />
<meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
<meta name="twitter:site" content="@handle" />
```

Rules:
- Use `summary_large_image` for pages with hero images (≥300×157 px).
- Use `summary` for text-only cards (≥144×144 px).

## Structured Data (JSON-LD)

Place in `<head>` or `<body>`. One `<script type="application/ld+json">` per schema type.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Site Name",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

Common `@type` values:
- `WebSite` — homepage
- `Organization` — company/brand
- `Product` — product pages (include `offers`, `aggregateRating`)
- `Article` / `NewsArticle` / `BlogPosting` — content pages
- `BreadcrumbList` — all non-home pages
- `FAQPage` — FAQ sections
- `HowTo` — tutorial/guide content
- `Event` — event pages

Validate with: https://search.google.com/test/rich-results

## Image Optimization

```html
<img
  src="hero.webp"
  alt="Descriptive text that conveys the image's purpose"
  width="1200"
  height="630"
  loading="lazy"
  decoding="async"
/>
```

Rules:
- Always specify `width` and `height` to prevent CLS (Cumulative Layout Shift).
- Use `loading="lazy"` for below-the-fold images. Never on LCP (Largest Contentful Paint) images.
- Prefer WebP/AVIF formats with `<picture>` fallback.
- Use descriptive `alt` text (not keyword-stuffed). Decorative images: `alt=""`.

## URL Structure

- Short, descriptive, keyword-rich: `/games/chess` not `/games/12345`
- Use hyphens, not underscores: `/my-page` not `/my_page`
- All lowercase
- No query parameters for indexable content
- Trailing slash consistency (pick one and stick to it)

## Sitemap (`sitemap.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Rules:
- Include all indexable pages.
- Exclude noindex, canonical duplicates, 4xx/5xx pages.
- `lastmod` reflects actual content change date, not build date.
- Max 50,000 URLs per sitemap. Use sitemap index for larger sites.
- Reference in `robots.txt`: `Sitemap: https://example.com/sitemap.xml`

## `robots.txt`

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
```

Rules:
- Block paths that produce duplicate or thin content.
- Never block CSS/JS (search engines need them for rendering).
- One `robots.txt` at domain root.

## Page Speed & Core Web Vitals

- **LCP** < 2.5s: Preload hero images/fonts (`<link rel="preload">`). Avoid lazy-loading LCP element.
- **FID/INP** < 200ms: Minimize main-thread JS. Defer non-critical scripts.
- **CLS** < 0.1: Set explicit `width`/`height` on images/embeds. Avoid injecting content above the fold after load.

## Next.js / React Specific

- Use Next.js `metadata` export (App Router) or `Head` component (Pages Router) for meta tags.
- Use `next/image` for automatic optimization, lazy loading, and width/height enforcement.
- Server Components are preferred — content renders server-side (crawlable by default).
- For dynamic routes, generate `metadata` dynamically and set `alternates.canonical`.
- Use `generateSitemap()` or a sitemap route handler for dynamic sitemaps.

```ts
// app/page.tsx — Server Component
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title – Site Name',
  description: '120–158 char description.',
  openGraph: {
    title: 'Page Title',
    description: 'Concise summary.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}
```

## Accessibility ↔ SEO Overlap

- Proper heading hierarchy (already affects SEO).
- ARIA labels on interactive elements.
- Skip-to-content link.
- Focus management for SPAs.
- `lang` attribute on `<html>`.

## Checklist Before Merge

- [ ] Unique `<title>` and `<meta name="description">` on every page
- [ ] Open Graph tags present with valid 1200×630 image
- [ ] Twitter Card tags present
- [ ] Canonical URL set (self-referencing)
- [ ] Structured data validates in Google Rich Results Test
- [ ] All images have `alt` text and explicit dimensions
- [ ] Semantic HTML used (not div-soup)
- [ ] Single `<h1>` per page, logical heading order
- [ ] `robots.txt` allows crawling of public pages
- [ ] Sitemap includes all indexable pages
- [ ] No broken internal links
- [ ] Page passes Lighthouse SEO audit (score ≥ 90)
