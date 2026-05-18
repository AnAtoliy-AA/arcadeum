import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import CookiePolicyClient from './CookiePolicyClient';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How we use cookies to improve your experience.',
};

/**
 * Cookie Policy Page
 * Fetches translations on the server and passes them to CookiePolicyClient.
 * Use CookiePolicyClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function CookiePolicyPage() {
  const messages = await getTranslations();
  const t = messages.pages?.cookies;

  return <CookiePolicyClient t={t} />;
}
