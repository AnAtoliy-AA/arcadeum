import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import { buildHowToJsonLd } from '@/shared/seo/howToJsonLd';
import { buildFaqPageJsonLd } from '@/shared/seo/faqPageJsonLd';
import ChessLanding from './ChessLanding';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

const CHESS_SLUG = 'chess_v1';
const CHESS_MIN_PLAYERS = 2;
const CHESS_MAX_PLAYERS = 2;
const CHESS_GENRE = 'Board Game';

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
  const base = await buildPageMetadata({ locale, page: 'chessLanding' });
  const messages = await getTranslations(locale);
  const landingMeta = messages.games?.chess_v1?.landing?.meta;
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/chess/opengraph-image`,
          width: 1200,
          height: 630,
          alt:
            landingMeta?.title ??
            'Chess: Free Online Multiplayer on Arcadeum Games',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/chess/opengraph-image`],
    },
  };
}

export default async function ChessLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const [comingSoon, messages] = await Promise.all([
    isGameComingSoon(CHESS_SLUG),
    getTranslations(locale),
  ]);
  const routes = buildRoutes(locale);

  const landing = messages.games?.chess_v1?.landing;
  const rules = messages.games?.chess_v1?.rules;
  const gameName = messages.games?.chess_v1?.name ?? 'Chess';
  const description =
    messages.games?.chess_v1?.description ?? landing?.meta?.description;

  const chessPageUrl = `${appConfig.siteUrl}${routes.chessLanding}`;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: CHESS_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: CHESS_MIN_PLAYERS,
      maxPlayers: CHESS_MAX_PLAYERS,
      genre: CHESS_GENRE,
      alternateName: [
        'Chess Online',
        'Play Chess Free',
        'Chess960',
        'Fischer Random Chess',
        'Bullet Chess',
        'Blitz Chess',
        'Rapid Chess',
        'Daily Chess',
        'Correspondence Chess',
        'Stockfish 19 Chess',
        'Puzzle Rush Chess',
        'Free Chess Game',
        'Online Chess Engine',
        'Multiplayer Chess',
        'Chess Tournaments',
        'Chess Puzzles',
        'Endgame Tablebase Chess',
        'Chess with Friends',
        'Chess vs AI',
        'Chess Analysis',
        'Chess Variants',
        'Atomic Chess',
        'Crazyhouse Chess',
        'King of the Hill Chess',
        'Three-Check Chess',
        'No Signup Chess',
        'Browser Chess',
        'Real-Time Chess',
        'Chess Bot',
        'Chess Personalities',
        'Online Chess Game Free',
        'Play Chess No Download',
      ],
      featureList: [
        'Stockfish 19 Engine with SFNNv16 NNUE',
        'Standard & Chess960 (Fischer Random)',
        '20 AI Bot Personalities (250–3200 Elo)',
        'Bullet, Blitz, Rapid, and Daily Correspondence',
        'Puzzle Rush & Tactical Training',
        'Interactive Analysis Board with Engine Evaluation',
        'Custom Board Editor & FEN/PGN Import',
        'Game Review with Accuracy Scores and Move Classification',
        'Syzygy 7-Piece Endgame Tablebases',
        'Real-time Auto-Matchmaking',
        '100% Free with Zero Downloads or Forced Signup',
      ],
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
    buildHowToJsonLd({
      name: `How to Play Chess on ${appConfig.appName}`,
      description:
        'Start playing chess online in seconds: create a room, invite a friend or add a bot, and play with full Stockfish 19 analysis.',
      steps: [
        {
          name: 'Create a room',
          text: 'Pick a variant (Standard, Chess960, or others), time control, and visual theme. Choose public or invite-only.',
        },
        {
          name: 'Invite a friend or add a bot',
          text: 'Share the direct link with a friend, use Quick Play auto-matchmaking, or start with one of 20 AI bot personalities for instant play.',
        },
        {
          name: 'Play, analyze, and improve',
          text: 'Make your moves on the interactive board. Get real-time Stockfish 19 analysis, review your game with accuracy scores, and track your rating progress.',
        },
      ],
      totalTime: 'PT2M',
      locale,
      pageUrl: chessPageUrl,
    }),
    ...(landing?.faq
      ? buildFaqPageJsonLd({
          pageName: gameName,
          pageUrl: chessPageUrl,
          faqs: Object.values(landing.faq).map((f) => ({
            question: (f as { question: string; answer: string }).question,
            answer: (f as { question: string; answer: string }).answer,
          })),
        })
      : []),
  ];

  return (
    <>
      <JsonLd id="json-ld-chess" data={jsonLd} />
      <ChessLanding
        landing={landing}
        comingSoon={comingSoon}
        rules={rules}
        gameId={CHESS_SLUG}
        roomsHref={`${routes.rooms}?gameId=${CHESS_SLUG}`}
        createRoomHref={`${routes.gameCreate}?gameId=${CHESS_SLUG}`}
        gamesHref={routes.games}
        homeHref={routes.home}
        locale={locale}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
        translatedGames={
          messages.games as Record<
            string,
            { name?: string; description?: string } | undefined
          >
        }
        puzzleHrefs={{
          daily: routes.chessDailyPuzzle,
          rated: routes.chessPuzzles,
          rush: routes.chessPuzzleRush,
          coordinates: routes.chessCoordinates,
        }}
      />
    </>
  );
}
