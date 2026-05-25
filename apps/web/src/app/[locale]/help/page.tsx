import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildFaqJsonLd, type FaqQuestion } from '@/shared/seo/faqJsonLd';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale, type Locale } from '@/shared/i18n';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import type { Metadata } from 'next';
import HelpClient from './HelpClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'help' }) : {};
}

/**
 * Help Page
 * Fetches translations on the server and passes them to HelpClient.
 * Use HelpClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : 'en';
  const messages = await getTranslations(safeLocale);
  const t = messages.pages?.help;

  // FAQ JSON-LD must mirror visible content on the page (Google's
  // structured-data guidelines). The same `items` array drives both the
  // rendered <details>/<summary> list and the schema, so they can't drift.
  const faqItems: FaqQuestion[] = Array.isArray(t?.faq?.items)
    ? (t.faq.items as FaqQuestion[]).filter(
        (item): item is FaqQuestion =>
          !!item &&
          typeof item.question === 'string' &&
          typeof item.answer === 'string',
      )
    : [];

  const helpUrl = `${appConfig.siteUrl}${buildRoutes(safeLocale).help}`;
  const faqJsonLd = buildFaqJsonLd({
    locale: safeLocale,
    questions: faqItems,
    pageUrl: helpUrl,
    // `#faq` is the FAQ block on HelpPageContent. Marking it speakable
    // is a hint to Google Assistant / voice surfaces about which slice
    // of the page is safe to read aloud in response to a spoken query.
    speakableSelectors: ['#faq'],
  });

  return (
    <>
      {faqJsonLd ? <JsonLd id="json-ld-help-faq" data={faqJsonLd} /> : null}
      <PageBreadcrumb locale={locale} page="help" />
      <HelpClient t={t} />
    </>
  );
}
