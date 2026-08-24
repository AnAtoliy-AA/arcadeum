import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildCollectionPageJsonLd } from '@/shared/seo/collectionPageJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { featuredGames } from '../../home/data/games';
import { JsonLd } from '@/shared/ui/JsonLd';
import { Container, PageLayout } from '@arcadeum/ui';
import { GamesCatalogClient, type CatalogGameItem } from './GamesCatalogClient';
import { OFFLINE_GAME_SLUGS } from '@/features/offline/lib/offline-capable';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'games' }) : {};
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

function resolveCategory(
  type: string,
  genre: string,
): 'board' | 'card' | 'casual' {
  if (type === 'card') return 'card';
  if (
    genre.toLowerCase().includes('race') ||
    genre.toLowerCase().includes('arcade')
  ) {
    return 'casual';
  }
  return 'board';
}

export default async function GamesCatalogRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const gamesNamespace = messages.games as
    | Record<
        string,
        { name?: string; description?: string; summary?: string } | undefined
      >
    | undefined;

  const catalogGames: CatalogGameItem[] = featuredGames.map((g) => {
    const name = gamesNamespace?.[g.id]?.name ?? g.id;
    const description =
      gamesNamespace?.[g.id]?.description ??
      gamesNamespace?.[g.id]?.summary ??
      '';
    const landingHref = g.landingHref
      ? `/${locale}${g.landingHref}`
      : routes.gameDetail(g.id);

    return {
      id: g.id,
      slug: g.id,
      name,
      description,
      genre: g.genre,
      pace: g.pace,
      category: resolveCategory(g.type, g.genre),
      categoryLabel: g.category,
      players: g.players,
      duration: g.duration,
      landingHref,
      offlineSlug:
        OFFLINE_GAME_SLUGS.find((o) => o.engineId === g.id)?.slug ?? null,
      accentColor: g.accentColor ?? '#60a5fa',
      isPlayable: g.isPlayable,
      isDemo: g.isDemo,
    };
  });

  const collectionItems = catalogGames.map((g) => ({
    name: g.name,
    url: g.landingHref,
    description: g.description,
  }));

  const collectionPage = buildCollectionPageJsonLd({
    locale,
    pageUrl: routes.games,
    name:
      messages.seo?.games?.title ??
      `${messages.navigation?.gamesTab ?? 'Games'} · ${appConfig.appName}`,
    description: messages.seo?.games?.description,
    items: collectionItems,
  });

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.navigation?.gamesTab ?? 'Games',
        url: routes.games,
      },
    ],
  });

  return (
    <PageLayout>
      <JsonLd
        id={`json-ld-games-${locale}`}
        data={[collectionPage, breadcrumb]}
      />
      <div className="box-border relative min-h-screen pb-16 overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="box-border pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent blur-3xl rounded-full"
          aria-hidden="true"
        />

        <Container size="lg">
          <div className="box-border relative flex flex-col gap-8 py-8 sm:py-12">
            {/* Header / Intro */}
            <div className="box-border flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
              <span className="box-border px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-sm">
                🎮 Multiplayer Games Directory
              </span>
              <h1 className="box-border m-0 text-3xl sm:text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight">
                Play Free Online Games
              </h1>
              <p className="box-border m-0 text-sm sm:text-base md:text-lg text-[var(--foreground)] opacity-80 leading-relaxed">
                Enjoy real-time board and card games directly in your browser
                with no download or signup. Challenge friends in private rooms
                or practice against intelligent AI bots.
              </p>

              <div className="box-border flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="box-border px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--glassBg)] text-[var(--foreground)] opacity-90 border border-[var(--borderColor)]">
                  ⚡ 8 Instant Games
                </span>
                <span className="box-border px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--glassBg)] text-[var(--foreground)] opacity-90 border border-[var(--borderColor)]">
                  🤖 Smart AI Bots
                </span>
                <span className="box-border px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--glassBg)] text-[var(--foreground)] opacity-90 border border-[var(--borderColor)]">
                  🎨 10+ Themes
                </span>
                <span className="box-border px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--glassBg)] text-[var(--foreground)] opacity-90 border border-[var(--borderColor)]">
                  📱 Mobile & Desktop
                </span>
              </div>
            </div>

            {/* Catalog Client (Filter & Grid) */}
            <GamesCatalogClient
              locale={locale}
              games={catalogGames}
              roomsHref={routes.rooms}
              offlineBadgeLabel={
                messages.pwa?.offlineGame?.chip ?? 'Offline play'
              }
            />
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}
