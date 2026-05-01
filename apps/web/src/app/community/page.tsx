import { getTranslations } from '@/shared/i18n/server';
import CommunityClient from './CommunityClient';

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
