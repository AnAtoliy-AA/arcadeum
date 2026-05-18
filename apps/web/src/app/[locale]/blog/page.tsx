import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'blog' })
    : {};
}

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
