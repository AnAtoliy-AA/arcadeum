import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Connect with other players in the Arcadeum community.',
};

/**
 * Community Page
 * Fetches translations on the server and passes them to CommunityClient.
 * Use CommunityClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function CommunityPage() {
  const messages = await getTranslations();
  const t = messages.pages?.community;

  return <CommunityClient t={t} />;
}
