import { cookies } from 'next/headers';
import {
  loadMessages,
  DEFAULT_LOCALE,
  type Locale,
  type TranslationBundle,
} from './index';

/**
 * Server-side utility to get translations based on the 'app-language' cookie.
 * This can only be used in Server Components or Server Actions.
 */
export async function getTranslations(): Promise<TranslationBundle> {
  const cookieStore = await cookies();
  const locale =
    (cookieStore.get('app-language')?.value as Locale) || DEFAULT_LOCALE;
  return loadMessages(locale);
}

/**
 * Get the current locale from cookies on the server.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return (cookieStore.get('app-language')?.value as Locale) || DEFAULT_LOCALE;
}
