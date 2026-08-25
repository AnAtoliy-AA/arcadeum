import type { Metadata } from 'next';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
import Game2048Landing from './Game2048Landing';

const GAME_2048_SLUG = 'game_2048_v1';

type PageProps = {
  params: Promise<{ locale: string }>;
};

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  return buildPageMetadata({ locale, page: 'game2048Landing' });
}

export default async function Game2048LandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const game = messages.games?.game_2048_v1;
  const landing = game?.landing;
  const rules = game?.rules;
  const gameName = game?.name ?? '2048';
  const description = game?.description ?? landing?.meta.description;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: GAME_2048_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: 1,
      maxPlayers: 1,
      genre: 'Puzzle',
      alternateName: ['2048 Game', '2048 Puzzle', 'Play 2048 Online'],
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  return (
    <>
      <JsonLd id="json-ld-game-2048" data={jsonLd} />
      <Game2048Landing
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        playHref={routes.game2048Play}
        rules={rules}
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, ['2048', 'Puzzle', 'Numbers'])}
      />
    </>
  );
}
