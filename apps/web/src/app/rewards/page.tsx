import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import RewardsClient from './RewardsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Rewards',
    description: `Earn cosmetic badges, early access decks, and exclusive perks on ${appConfig.appName} by playing and inviting friends.`,
    path: routes.rewards,
    keywords: [
      'board game rewards',
      'earn badges',
      'referral rewards',
      'unlocks',
    ],
    locale,
  });
}

const REWARDS_JSON_LD = [
  webPage({
    name: `Rewards — ${appConfig.appName}`,
    description: 'Earn rewards for playing and referring friends.',
    path: routes.rewards,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Rewards', path: routes.rewards },
  ]),
];

export default async function RewardsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.rewards;

  return (
    <>
      <JsonLd data={REWARDS_JSON_LD} />
      <RewardsClient t={t} />
    </>
  );
}
