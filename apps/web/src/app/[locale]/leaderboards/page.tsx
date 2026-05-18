import { getTranslations } from '@/shared/i18n/server';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import type { Metadata } from 'next';
import LeaderboardsClient from './LeaderboardsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'leaderboards' })
    : {};
}

export default async function LeaderboardsPage() {
  const messages = await getTranslations();
  const t = messages.pages?.leaderboards;
  const accessToken = await getServerAccessToken();
  // Mock fallback (NEXT_PUBLIC_E2E / NEXT_PUBLIC_USE_LEADERBOARD_MOCK) keys
  // its synthetic self row off this opaque id; the real BE resolves the user
  // from the access token via JwtOptionalAuthGuard.
  const selfId = accessToken ? accessToken.slice(0, 16) : undefined;

  return (
    <LeaderboardsClient
      t={t}
      selfId={selfId}
      accessToken={accessToken ?? undefined}
    />
  );
}
