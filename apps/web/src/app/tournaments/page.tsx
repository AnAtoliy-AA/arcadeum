import { getTranslations } from '@/shared/i18n/server';
import TournamentsClient from './TournamentsClient';

/**
 * Tournaments Page
 * Fetches translations on the server and passes them to TournamentsClient.
 * Use TournamentsClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function TournamentsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.tournaments;

  return <TournamentsClient t={t} />;
}
