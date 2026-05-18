import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import RewardsClient from './RewardsClient';

export const metadata: Metadata = {
  title: 'Rewards',
  description: 'Earn rewards for playing and referring friends.',
};

/**
 * Rewards Page
 * Fetches translations on the server and passes them to RewardsClient.
 * Use RewardsClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function RewardsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.rewards;

  return <RewardsClient t={t} />;
}
