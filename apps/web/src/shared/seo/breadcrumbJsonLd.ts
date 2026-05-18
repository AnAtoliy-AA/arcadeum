import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';

export interface BreadcrumbItem {
  /** Display label (already localized by the caller). */
  name: string;
  /** Absolute or root-relative URL of the breadcrumb step. */
  url: string;
}

/**
 * Build a schema.org BreadcrumbList. Caller passes already-localized
 * labels + per-locale URLs; the helper adds the Home item at position
 * 1 automatically so every breadcrumb starts at the locale root.
 */
export function buildBreadcrumbJsonLd({
  locale,
  homeLabel,
  trail,
}: {
  locale: Locale;
  homeLabel: string;
  /** Steps AFTER home, in order. */
  trail: BreadcrumbItem[];
}): Record<string, unknown> {
  const routes = buildRoutes(locale);
  const home: BreadcrumbItem = {
    name: homeLabel,
    url: `${appConfig.siteUrl}${routes.home}`,
  };
  const all = [home, ...trail];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((step, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: step.name,
      item: step.url.startsWith('http')
        ? step.url
        : `${appConfig.siteUrl}${step.url}`,
    })),
  };
}
