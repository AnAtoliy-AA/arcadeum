import { JsonLd } from '@/shared/ui/JsonLd';
import { buildBreadcrumbJsonLd } from './breadcrumbJsonLd';
import { buildRoutes, type Routes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import type { SeoPageKey } from './buildPageMetadata';

interface PageBreadcrumbProps {
  /** Active locale from `params.locale`. */
  locale: string;
  /**
   * Page identifier — used to look up the localized breadcrumb label
   * (from `seo[page].title`) and the canonical URL via `buildRoutes`.
   */
  page: SeoPageKey;
  /**
   * Optional override for the page's URL (for dynamic routes that don't
   * map 1:1 onto a `Routes` field).
   */
  pathFor?: (routes: Routes) => string;
  /**
   * Optional override for the visible label. Defaults to
   * `seo[page].title`. Useful when the SEO title is longer than the
   * desired breadcrumb crumb.
   */
  label?: string;
}

/**
 * Drop-in `<PageBreadcrumb locale={locale} page="settings" />` for any
 * `[locale]/<page>/page.tsx`. Emits a schema.org BreadcrumbList with
 * the localized home label as position 1 and the page label as
 * position 2. Server component — no hydration cost.
 */
export async function PageBreadcrumb({
  locale: rawLocale,
  page,
  pathFor,
  label,
}: PageBreadcrumbProps) {
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const url = pathFor
    ? pathFor(routes)
    : (routes[page as keyof Routes] as string | undefined);

  if (!url) return null;

  const name =
    label ??
    messages.seo?.[page]?.title ??
    page.charAt(0).toUpperCase() + page.slice(1);

  const data = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [{ name, url }],
  });

  return <JsonLd id={`json-ld-breadcrumb-${page}-${locale}`} data={data} />;
}
