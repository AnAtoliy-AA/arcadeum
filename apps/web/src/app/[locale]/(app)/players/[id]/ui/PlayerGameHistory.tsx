'use client';

export interface PlayerGameHistoryProps {
  recentForm: ('W' | 'L' | 'D')[];
  playerName: string;
  modes?: string[];
}

const GAME_INFO: Record<string, { name: string; icon: string }> = {
  chess: { name: 'Chess', icon: '♟️' },
  chess_v1: { name: 'Chess', icon: '♟️' },
  critical: { name: 'Critical', icon: '💥' },
  critical_v1: { name: 'Critical', icon: '💥' },
  sea_battle: { name: 'Sea Battle', icon: '🚢' },
  sea_battle_v1: { name: 'Sea Battle', icon: '🚢' },
  checkers: { name: 'Checkers', icon: '⚪' },
  checkers_v1: { name: 'Checkers', icon: '⚪' },
  backgammon: { name: 'Backgammon', icon: '🎲' },
  cat_dash: { name: 'Cat Dash', icon: '🐾' },
  cat_dash_v1: { name: 'Cat Dash', icon: '🐾' },
  cascade: { name: 'Cascade', icon: '🃏' },
  cascade_v1: { name: 'Cascade', icon: '🃏' },
};

const DEFAULT_GAMES = [
  'chess',
  'critical',
  'sea_battle',
  'backgammon',
  'checkers',
];

export function PlayerGameHistory({
  recentForm,
  playerName,
  modes,
}: PlayerGameHistoryProps) {
  const activeModes = modes && modes.length > 0 ? modes : DEFAULT_GAMES;

  if (!recentForm || recentForm.length === 0) {
    return (
      <div
        data-testid="player-game-history"
        className="flex flex-col gap-3 w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 backdrop-blur-xl"
      >
        <h2 className="text-base font-bold uppercase tracking-wider text-[var(--colorMuted)]">
          Recent Match History
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-[var(--colorMuted)]">
          <span>No recent matches found for {playerName}.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="player-game-history"
      className="flex flex-col gap-4 w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold uppercase tracking-wider text-[var(--colorMuted)]">
          Recent Match History
        </h2>
        <span className="text-xs text-[var(--colorMuted)] font-medium">
          Last {recentForm.length} competitive matches
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {recentForm.map((result, index) => {
          const modeKey = activeModes[index % activeModes.length] ?? 'chess';
          const game = GAME_INFO[modeKey] ?? { name: modeKey, icon: '🎮' };
          const isWin = result === 'W';
          const isLoss = result === 'L';
          const resultLabel = isWin ? 'Victory' : isLoss ? 'Defeat' : 'Draw';
          const ratingDelta = isWin ? '+16' : isLoss ? '-14' : '±0';
          const timeLabel =
            index === 0
              ? 'Just now'
              : index === 1
                ? '2 hours ago'
                : index === 2
                  ? 'Yesterday'
                  : `${index} days ago`;

          return (
            <div
              key={index}
              data-testid={`match-item-${index}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--borderColor)] bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg">
                  {game.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--color)]">
                    {game.name}
                  </span>
                  <span className="text-xs text-[var(--colorMuted)]">
                    Competitive Ranked · {timeLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold ${
                    isWin
                      ? 'text-emerald-400'
                      : isLoss
                        ? 'text-rose-400'
                        : 'text-slate-400'
                  }`}
                >
                  {ratingDelta} pts
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                    isWin
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : isLoss
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                        : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
                  }`}
                >
                  {resultLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
