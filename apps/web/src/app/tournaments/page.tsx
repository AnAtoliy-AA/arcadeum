import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';
import TournamentsClient from './TournamentsClient';

export const metadata: Metadata = {
  title: 'Tournaments',
  description: 'Join competitive tournaments and win prizes.',
  alternates: {
    canonical: routes.tournaments,
  },
};

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
