# ARC-702 — Global `[locale]` in URL

## Why

The web app currently stores the active locale in a cookie (`app-language`) and a Zustand store. URLs are locale-agnostic (`/games`, `/settings`, ...), which prevents:

- Sharing a deep link in a specific language
- SEO indexing of localized variants (no canonical URL per locale, no `hreflang`)
- Pre-rendering localized pages independently
- Crawlers / Open Graph previews from rendering the right language

ARC-702 moves locale into the URL path: `/en/games`, `/fr/settings`, …. URL becomes the source of truth.

## Scope

In scope:

- Add a `[locale]` dynamic segment as the top-level path prefix.
- Always show the locale (including `en`). Every URL is canonical.
- Middleware redirects unprefixed requests (`/`, `/games`) to a prefixed URL using cookie → `Accept-Language` → default (`en`).
- `routes.ts` refactored to locale-aware helpers.
- `getTranslations()` / server locale resolved from route `params`, not cookie.
- `LanguageProvider` reads locale from URL via `useParams()`; `setLocale(next)` performs `router.replace` to the new locale path.
- Sitemap emits one entry per `(route, locale)` and pages declare `alternates.languages` (hreflang).
- Update Vitest tests for the language provider; update Playwright e2e tests that hard-code unprefixed paths.

Out of scope:

- Translating route slugs themselves (`/fr/jeux`).
- Changing the supported-locales list.
- Redesigning the language switcher.
- Mobile / backend changes.

## Architecture

### Folder layout

```
src/app/
  layout.tsx                  # html/body + fonts (no providers, no locale)
  globals.css
  not-found.tsx               # global fallback (no locale)
  robots.ts
  sitemap.ts                  # emits all locales × all routes
  offline/                    # offline shell — no locale prefix (served by SW)
  [locale]/
    layout.tsx                # providers (Language/Theme/PWA/AppShell)
    page.tsx                  # was /page.tsx (home)
    not-found.tsx             # localized 404
    games/...                 # all existing routes move here
    settings/...
    ...
middleware.ts                 # locale-prefix enforcement
```

Pages that should never carry a locale prefix stay outside `[locale]`:

- `/offline` — service-worker fallback
- `/robots.txt`, `/sitemap.xml` — crawler endpoints

### Middleware

`src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/shared/i18n';

const PUBLIC_FILE =
  /\.(?:png|jpg|jpeg|webp|avif|svg|ico|txt|xml|js|map|json|woff2?)$/i;
const SKIP_PREFIXES = ['/_next', '/_vercel', '/api', '/sw.js', '/offline'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p)))
    return NextResponse.next();
  if (PUBLIC_FILE.test(pathname)) return NextResponse.next();

  const firstSegment = pathname.split('/')[1];
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale))
    return NextResponse.next();

  const cookieLocale = req.cookies.get('app-language')?.value;
  const headerLocale = req.headers
    .get('accept-language')
    ?.split(',')[0]
    ?.split('-')[0];

  const locale =
    pickSupported(cookieLocale) ??
    pickSupported(headerLocale) ??
    DEFAULT_LOCALE;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
```

### Routes helper

`src/shared/config/routes.ts` becomes locale-aware:

```ts
import type { Locale } from '@/shared/i18n';

export const buildRoutes = (locale: Locale) => ({
  home: `/${locale}`,
  auth: `/${locale}/auth`,
  games: `/${locale}/games`,
  gameDetail: (id: string) => `/${locale}/games/${id}`,
  // ...
});

export type Routes = ReturnType<typeof buildRoutes>;
```

Consumers:

- Server components / metadata: call `buildRoutes(locale)` where `locale` comes from `params`.
- Client components: use `const routes = useRoutes()` — a thin hook that reads locale from `useParams()`.

### i18n

`getTranslations()` / `getServerLocale()` now accept the locale (from `params.locale`) rather than reading the cookie:

```ts
export async function getTranslations(
  locale: Locale,
): Promise<TranslationBundle> {
  return loadMessages(locale);
}
```

Pages call:

```ts
export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations(locale);
  // ...
}
```

`LanguageProvider` now treats URL as source of truth:

- Reads initial locale from `params.locale` (passed in by `[locale]/layout.tsx`).
- `setLocale(next)` calls `router.replace(swapLocale(pathname, next))` + writes cookie for next entry.
- The Zustand store is removed (single source of truth = URL).

### Sitemap & hreflang

`sitemap.ts` produces:

```ts
SUPPORTED_LOCALES.flatMap((locale) =>
  routePaths.map((path) => ({
    url: `${siteUrl}/${locale}${path}`,
    alternates: {
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `${siteUrl}/${l}${path}`]),
      ),
    },
    // ...
  })),
);
```

Each `[locale]/<page>/page.tsx` exports metadata with `alternates.languages` and `alternates.canonical`.

### Open Graph locale

Root `layout.tsx` removes hard-coded `locale: 'en_US'`. The `[locale]/layout.tsx` sets it dynamically:

```ts
openGraph: {
  locale: localeToOg(locale);
}
```

with a small map: `en → en_US`, `fr → fr_FR`, `es → es_ES`, `ru → ru_RU`, `by → be_BY`.

## Migration risks

| Risk                                                          | Mitigation                                                                                                                        |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| External links / bookmarks to `/games` break                  | Middleware 308-redirects to `/<cookie-locale>/games` — link still works.                                                          |
| Existing `next-pwa` `start_url` in manifest                   | Update manifest `start_url` to `/en` (or read from cookie at runtime — not possible in static manifest; pick a sensible default). |
| Playwright e2e tests asserting raw paths                      | Update tests to use `/en/...` or a `localized(path)` helper.                                                                      |
| `next.config.js` `redirects()` rule `/home → /`               | Adjust to `/<locale>/home → /<locale>` via dynamic redirect rule.                                                                 |
| CSP / cache headers in `next.config.js` keyed on `/games/...` | Update matchers to `/:locale/games/...`.                                                                                          |

## Testing strategy

- Unit (Vitest): `LanguageProvider` reads from URL, `setLocale` swaps URL.
- Unit: `middleware.ts` — table-driven test on locale resolution order.
- E2E (Playwright): hit `/` → expect redirect to `/en`. Switch language → URL updates and content changes. Direct link `/fr/games` renders French.
- `pnpm check-file-length`, `pnpm lint`, `pnpm test`, `pnpm build` all green.

## Rollout

Single PR. Feature is structural and cannot be feature-flagged cleanly; the middleware + folder move are atomic.
