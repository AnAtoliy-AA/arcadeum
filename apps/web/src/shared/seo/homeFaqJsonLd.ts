import type { Locale } from '@/shared/i18n';

/**
 * FAQPage schema is restricted to government and healthcare authority
 * sites only (Google, August 2023). Returning an empty array avoids the
 * "unrecognized schema" warning in Search Console while the FAQ content
 * remains available as visible HTML on the page for regular indexing.
 */
export function buildHomeFaqJsonLd(_locale: Locale): Record<string, unknown>[] {
  return [];
}
