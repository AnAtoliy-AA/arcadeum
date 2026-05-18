import type { Metadata } from 'next';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import TournamentsClient from './TournamentsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'tournaments' })
    : {};
}

/**
 * Tournaments Page (public). Translations are read on the client via
 * useLanguage to support the locale + nested list shape.
 */
export default function TournamentsPage() {
  return <TournamentsClient />;
}
