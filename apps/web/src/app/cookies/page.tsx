import { getTranslations } from '@/shared/i18n/server';
import CookiePolicyClient from './CookiePolicyClient';

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
