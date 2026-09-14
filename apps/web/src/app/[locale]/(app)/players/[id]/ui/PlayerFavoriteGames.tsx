'use client';

import Link from 'next/link';

export interface PlayerFavoriteGamesProps {
  modeRanks: Array<{
    mode: string;
    rank: number;
    rating: number;
  }>;
}

const MODE_TO_GAME_PATH: Record<
  string,
  { name: string; path: string; icon: string }
> = {
  all: { name: 'Overall Leaderboard', path: '/leaderboards', icon: '🏆' },
  chess: { name: 'Chess', path: '/games/chess', icon: '♟️' },
  chess_v1: { name: 'Chess', path: '/games/chess', icon: '♟️' },
  critical: { name: 'Critical', path: '/games/critical', icon: '💥' },
  critical_v1: { name: 'Critical', path: '/games/critical', icon: '💥' },
  sea_battle: { name: 'Sea Battle', path: '/games/sea-battle', icon: '🚢' },
  sea_battle_v1: { name: 'Sea Battle', path: '/games/sea-battle', icon: '🚢' },
  checkers: { name: 'Checkers', path: '/games/checkers', icon: '⚪' },
  checkers_v1: { name: 'Checkers', path: '/games/checkers', icon: '⚪' },
  backgammon: { name: 'Backgammon', path: '/games/backgammon', icon: '🎲' },
  cat_dash: { name: 'Cat Dash', path: '/games/cat-dash', icon: '🐾' },
  cat_dash_v1: { name: 'Cat Dash', path: '/games/cat-dash', icon: '🐾' },
  cascade: { name: 'Cascade', path: '/games/cascade', icon: '🃏' },
  cascade_v1: { name: 'Cascade', path: '/games/cascade', icon: '🃏' },
  tic_tac_toe_v1: {
    name: 'Tic-Tac-Toe',
    path: '/games/tic-tac-toe',
    icon: '❌',
  },
  glimworm_v1: { name: 'Glimworm', path: '/games/glimworm', icon: '🐛' },
};

export function PlayerFavoriteGames({ modeRanks }: PlayerFavoriteGamesProps) {
  const filteredModes = modeRanks.filter((m) => m.mode !== 'all');
  const displayModes = filteredModes.length > 0 ? filteredModes : modeRanks;

  return (
    <div
      data-testid="player-favorite-games"
      className="flex flex-col gap-4 w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold uppercase tracking-wider text-[var(--colorMuted)]">
          Favorite Games & Ranks
        </h2>
        <span className="text-xs text-[var(--colorMuted)] font-medium">
          {displayModes.length} active modes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayModes.map((item) => {
          const game = MODE_TO_GAME_PATH[item.mode] ?? {
            name: item.mode,
            path: '/games',
            icon: '🎮',
          };

          return (
            <div
              key={item.mode}
              data-testid={`fav-game-${item.mode}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--borderColor)] bg-white/5 p-3 transition-all hover:bg-white/10 hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xl">
                  {game.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--color)]">
                    {game.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--colorMuted)]">
                    <span className="font-semibold text-amber-400">
                      Rank #{item.rank}
                    </span>
                    <span>·</span>
                    <span>{item.rating} Elo</span>
                  </div>
                </div>
              </div>

              <Link
                href={game.path}
                className="rounded-lg border border-[var(--glassBorder)] bg-white/5 px-2.5 py-1 text-xs font-semibold text-[var(--color)] hover:bg-white/15 transition-all"
              >
                Play
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
