import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import DevelopersClient from './DevelopersClient';

export const metadata: Metadata = {
  title: 'Developers',
  description: 'API documentation and developer resources.',
};

/**
 * Developers Page
 * Fetches translations on the server and passes them to DevelopersClient.
 * Use DevelopersClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function DevelopersPage() {
  const messages = await getTranslations();
  const t = messages.pages?.developers;

  return <DevelopersClient t={t} />;
}
