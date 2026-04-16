import { getTranslations } from '@/shared/i18n/server';
import BlogClient from './BlogClient';

/**
 * Blog Page
 * Fetches translations on the server and passes them to BlogClient.
 * Use BlogClient for client-side only rendering to avoid Tamagui hydration issues.
 */
export default async function BlogPage() {
  const messages = await getTranslations();
  const t = messages.pages?.blog;

  return <BlogClient t={t} />;
}
