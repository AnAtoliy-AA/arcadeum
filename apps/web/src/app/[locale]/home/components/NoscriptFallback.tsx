import Link from 'next/link';
import { appConfig } from '@/shared/config/app-config';
import type { Locale } from '@/shared/i18n';

const GAMES = [
  {
    id: 'sea_battle_v1',
    name: 'Sea Battle (Battleship)',
    description:
      'Classic naval combat strategy game. Place your ships, guess coordinates, and sink the enemy fleet.',
    players: '2–4',
    duration: '10 min',
    href: '/games/sea-battle',
  },
  {
    id: 'critical_v1',
    name: 'Critical',
    description:
      'Strategic card game: draw, defuse, and survive the explosion.',
    players: '3–5',
    duration: '15 min',
    href: '/games/critical',
  },
  {
    id: 'tic_tac_toe_v1',
    name: 'Tic-Tac-Toe',
    description: 'Six themed variants with boards from 3×3 to 9×9.',
    players: '2–5',
    duration: '5 min',
    href: '/games/tic-tac-toe',
  },
  {
    id: 'cascade_v1',
    name: 'Cascade',
    description:
      'Shedding card game with Draw-Two and Wild +4 stacking chains.',
    players: '2–10',
    duration: '10 min',
    href: '/games/cascade',
  },
  {
    id: 'chess_v1',
    name: 'Chess',
    description: 'Classic strategy game for two players with AI bot support.',
    players: '2',
    duration: '15 min',
    href: '/games/chess',
  },
  {
    id: 'checkers_v1',
    name: 'Checkers',
    description:
      'Classic 8×8 board game with forced captures and king promotion.',
    players: '2',
    duration: '10 min',
    href: '/games/checkers',
  },
  {
    id: 'game_2048',
    name: '2048',
    description:
      'Slide and merge numbered tiles on a 4×4 grid to reach the 2048 tile.',
    players: '1',
    duration: '5 min',
    href: '/games/2048',
  },
  {
    id: 'glimworm_v1',
    name: 'Glimworm',
    description:
      'Real-time glow-worm snake arena. Slither, survive, and eat the lights.',
    players: '2–10',
    duration: '90 sec',
    href: '/games/glimworm',
  },
];

const FEATURES = [
  {
    icon: '🎮',
    title: 'Real-time Rooms',
    description:
      'Create game rooms instantly and start playing with friends in seconds.',
  },
  {
    icon: '⚡',
    title: 'Automated Rules',
    description:
      'The app handles rules, scoring, and turn management automatically.',
  },
  {
    icon: '📱',
    title: 'Cross-platform',
    description:
      'Play in your browser on desktop and mobile. No downloads required.',
  },
  {
    icon: '🔒',
    title: 'Private Rooms & Chat',
    description: 'Secured rooms with integrated chat for your group.',
  },
  {
    icon: '📊',
    title: 'Game Statistics',
    description: 'Track win rates, history, and achievements across all games.',
  },
  {
    icon: '🏆',
    title: 'Tournaments',
    description: 'Compete in ranked events against the best players.',
  },
];

export function NoscriptFallback({ locale }: { locale: Locale }) {
  return (
    <noscript>
      <div className="mx-auto max-w-[1200px] p-8">
        <section aria-labelledby="noscript-games-heading" className="mb-12">
          <h2 id="noscript-games-heading" className="mb-4 text-2xl">
            Featured Games
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {GAMES.map((game) => (
              <article
                key={game.id}
                className="rounded-xl border border-[#333] p-6"
              >
                <h3 className="mb-2 text-xl">{game.name}</h3>
                <p className="mb-4 text-[#999]">{game.description}</p>
                <div className="flex gap-4 text-sm text-[#666]">
                  <span>
                    <strong>{game.players}</strong> players
                  </span>
                  <span>
                    <strong>{game.duration}</strong> match
                  </span>
                </div>
                <Link
                  href={`/${locale}${game.href}`}
                  className="mt-4 inline-block rounded-lg bg-[#3b82f6] px-4 py-2 text-white no-underline"
                >
                  Play {game.name}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="noscript-features-heading" className="mb-12">
          <h2 id="noscript-features-heading" className="mb-4 text-2xl">
            Why {appConfig.appName}?
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[#333] p-6"
              >
                <div className="mb-2 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg">{feature.title}</h3>
                <p className="text-[#999]">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="noscript-cta-heading">
          <h2 id="noscript-cta-heading" className="mb-4 text-2xl">
            Get Started
          </h2>
          <p className="mb-4">
            Play free online board games, card games, and multiplayer mini-games
            with friends. No download required.
          </p>
          <Link
            href={`/${locale}/games`}
            className="inline-block rounded-lg bg-[#3b82f6] px-6 py-3 font-bold text-white no-underline"
          >
            Browse All Games
          </Link>
        </section>
      </div>
    </noscript>
  );
}
