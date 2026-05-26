import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import TicTacToeLanding from './TicTacToeLanding';

void appConfig;
const TIC_TAC_TOE_SLUG = 'tic_tac_toe_v1';
const TIC_TAC_TOE_MIN_PLAYERS = 2;
const TIC_TAC_TOE_MAX_PLAYERS = 4;
const TIC_TAC_TOE_GENRE = 'Board Game';

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
  return buildPageMetadata({ locale, page: 'ticTacToeLanding' });
}

export default async function TicTacToeLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.tic_tac_toe_v1?.landing;
  const variants = messages.games?.tic_tac_toe_v1?.variants;
  const rules = messages.games?.tic_tac_toe_v1?.rules;
  const gameName = messages.games?.tic_tac_toe_v1?.name ?? 'Tic-Tac-Toe';
  const description =
    messages.games?.tic_tac_toe_v1?.description ?? landing?.meta?.description;

  const jsonLd = buildVideoGameJsonLd({
    gameId: TIC_TAC_TOE_SLUG,
    gameName,
    description: description ?? '',
    locale,
    minPlayers: TIC_TAC_TOE_MIN_PLAYERS,
    maxPlayers: TIC_TAC_TOE_MAX_PLAYERS,
    genre: TIC_TAC_TOE_GENRE,
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
      game: gameName,
    },
  });

  return (
    <>
      <JsonLd id="json-ld-tic-tac-toe" data={jsonLd} />
      <TicTacToeLanding
        landing={landing}
        variants={variants}
        rules={rules}
        createRoomHref={`${routes.gameCreate}?gameId=${TIC_TAC_TOE_SLUG}`}
        roomsHref={routes.games}
        gamesHref={routes.games}
        homeHref={routes.home}
      />
    </>
  );
}
