import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildProfilePageJsonLd } from '@/shared/seo/profilePageJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { getPlayer } from '@/shared/api/leaderboard';
import { AchievementsList } from '@/features/achievements/ui/AchievementsList';
import PlayerProfileClient from './PlayerProfileClient';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Extract the session user id (`sub` claim) from a JWT access token.
 * The web app keeps no server-side session store, and the token is
 * opaque to pages, so decoding the payload is the only way to learn
 * who is viewing. Returns null for malformed/expired tokens.
 */
function getSessionUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // JWT payloads are base64url; convert to standard base64 alphabet.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(
      Buffer.from(base64, 'base64').toString('utf8'),
    ) as { sub?: unknown }; // JSON.parse yields `any`; narrow immediately.
    return typeof claims.sub === 'string' ? claims.sub : null;
  } catch {
    return null;
  }
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
  const routes = buildRoutes(locale);
  const profileLabel = messages.seo?.playerProfile?.title ?? 'Player profile';

  // Achievements are cookie-scoped, so only mount the section when the
  // viewed profile belongs to the authenticated user.
  const accessToken = await getServerAccessToken();
  const sessionUserId = accessToken
    ? getSessionUserIdFromToken(accessToken)
    : null;
  const isSelf = !!sessionUserId && sessionUserId === id;

  // Fetch the profile server-side: the display name lands in both the
  // JSON-LD and the initial HTML instead of a "Loading…" placeholder, and
  // the client hydrates from these props without a second fetch.
  let initialProfile: Awaited<ReturnType<typeof getPlayer>> | null = null;
  try {
    initialProfile = await getPlayer(id, accessToken);
  } catch {
    initialProfile = null;
  }
  const displayName = initialProfile?.player.name ?? profileLabel;

  const profile = buildProfilePageJsonLd({
    locale,
    playerId: id,
    displayName,
    description: messages.seo?.playerProfile?.description,
  });
  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.seo?.leaderboards?.title ?? 'Leaderboards',
        url: routes.leaderboards,
      },
      {
        name: profileLabel,
        url: `${routes.home}/players/${encodeURIComponent(id)}`,
      },
    ],
  });

  return (
    <>
      <JsonLd
        id={`json-ld-player-${id}-${locale}`}
        data={[profile, breadcrumb]}
      />
      <PlayerProfileClient
        id={id}
        t={t}
        initialProfile={initialProfile}
        achievementsSlot={
          isSelf ? await AchievementsList({ locale, userId: id }) : undefined
        }
      />
    </>
  );
}
