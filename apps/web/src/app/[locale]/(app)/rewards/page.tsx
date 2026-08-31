import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { getSocialRewardsStatus } from '@/features/social-rewards/server/social-rewards.server';
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
  const [messages, socialRewardsStatus] = await Promise.all([
    getTranslations(locale),
    getSocialRewardsStatus(),
  ]);
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

  const jsonLdData = [breadcrumb];

  return (
    <>
      <JsonLd id={`json-ld-rewards-${locale}`} data={jsonLdData} />
      <RewardsClient t={t} socialRewardsStatus={socialRewardsStatus} />
    </>
  );
}
