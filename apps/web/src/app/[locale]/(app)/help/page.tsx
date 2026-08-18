import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildFaqJsonLd, type FaqQuestion } from '@/shared/seo/faqJsonLd';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import HelpClient from './HelpClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'help' }) : {};
}

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.help;
  const routes = buildRoutes(locale);

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.help?.title ?? 'Help Center',
        url: routes.help,
      },
    ],
  });

  const faqItems: FaqQuestion[] = Array.isArray(t?.faq?.items)
    ? (t.faq.items as FaqQuestion[]).filter(
        (item): item is FaqQuestion =>
          !!item &&
          typeof item.question === 'string' &&
          typeof item.answer === 'string',
      )
    : [];

  const helpUrl = `${appConfig.siteUrl}${routes.help}`;
  const faqJsonLd = buildFaqJsonLd({
    locale,
    questions: faqItems,
    pageUrl: helpUrl,
    speakableSelectors: ['#faq'],
  });

  const jsonLdData = faqJsonLd ? [breadcrumb, faqJsonLd] : [breadcrumb];

  return (
    <>
      <JsonLd id={`json-ld-help-${locale}`} data={jsonLdData} />
      <HelpClient t={t} />
    </>
  );
}
