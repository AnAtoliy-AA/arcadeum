import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildFaqJsonLd, type FaqQuestion } from '@/shared/seo/faqJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import RewardsClient from './RewardsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'rewards' }) : {};
}

export default async function RewardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.rewards;
  const routes = buildRoutes(locale);

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.rewards?.title ?? 'Rewards',
        url: routes.rewards,
      },
    ],
  });

  const rawFaqItems = t?.faq?.items ?? [];
  const faqQuestions: FaqQuestion[] = rawFaqItems
    .filter((item): item is { question: string; answer: string } =>
      Boolean(item?.question && item?.answer),
    )
    .map((item) => ({
      question: item.question,
      answer: item.answer,
    }));

  const faqSchema = buildFaqJsonLd({
    locale,
    questions: faqQuestions,
    pageUrl: `${routes.rewards}`,
    speakableSelectors: ['#faq'],
  });

  const jsonLdData = faqSchema ? [breadcrumb, faqSchema] : [breadcrumb];

  return (
    <>
      <JsonLd id={`json-ld-rewards-${locale}`} data={jsonLdData} />
      <RewardsClient t={t} />
    </>
  );
}
