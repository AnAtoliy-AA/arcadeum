import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import PlayerProfileClient from './PlayerProfileClient';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  return buildPageMetadata({
    locale,
    page: 'playerProfile',
    // /<locale>/players/<id> — same shape across locales.
    pathFor: (r) => `${r.home}/players/${encodeURIComponent(id)}`,
  });
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const messages = await getTranslations(locale);
  const t = messages.pages?.leaderboards;
  return <PlayerProfileClient id={id} t={t} />;
}
