import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import HelpClient from './HelpClient';

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Find answers to common questions and learn how to use the platform.',
};

/**
 * Help Page
 * Fetches translations on the server and passes them to HelpClient.
 * Use HelpClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function HelpPage() {
  const messages = await getTranslations();
  const t = messages.pages?.help;

  return <HelpClient t={t} />;
}
