import Link from 'next/link';

interface ChessHeroLaunchpadProps {
  gameId?: string;
  theme?: string;
  roomsHref: string;
  createRoomHref?: string;
  dailyPuzzleHref?: string;
  ratedPuzzlesHref?: string;
  puzzleRushHref?: string;
}

export function ChessHeroLaunchpad({
  gameId: _gameId,
  theme: _theme,
  roomsHref,
  createRoomHref,
  dailyPuzzleHref = '#puzzles',
}: ChessHeroLaunchpadProps) {
  const create960Href = createRoomHref
    ? `${createRoomHref}${createRoomHref.includes('?') ? '&' : '?'}variant=chess960`
    : undefined;

  return (
    <div
      data-testid="chess-hero-launchpad"
      className="box-border relative w-full rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] shadow-2xl backdrop-blur-xl p-4 sm:p-5 flex flex-col gap-3.5 overflow-hidden"
    >
      <div className="box-border flex items-center justify-between gap-2 border-b border-[var(--borderColor)]/40 pb-3">
        <div className="box-border flex items-center gap-2 min-w-0">
          <span className="box-border text-base shrink-0">♟️</span>
          <span className="box-border text-xs sm:text-sm font-bold tracking-tight text-[var(--foreground)]">
            Quick Match & Modes
          </span>
        </div>
        <div className="box-border shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold whitespace-nowrap">
          <span className="box-border w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span>Stockfish 19</span>
        </div>
      </div>

      <div className="box-border grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <a
          href="#quickplay-human-button"
          className="box-border flex flex-col p-3 rounded-xl bg-[var(--surfaceBg)] border border-[var(--borderColor)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all no-underline group"
        >
          <div className="box-border flex items-center justify-between mb-2">
            <span className="box-border text-lg leading-none">⚡</span>
            <span className="box-border shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Rated
            </span>
          </div>
          <span className="box-border text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--color)] transition-colors mb-1">
            Blitz Matchmaking
          </span>
          <p className="box-border m-0 text-[11px] text-[var(--foreground)] opacity-75 mb-3 leading-snug">
            3+2 rated auto-matchmaking against human opponents.
          </p>
          <span className="box-border mt-auto text-xs font-semibold text-[var(--color)] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Quick Match →
          </span>
        </a>

        <Link
          href={dailyPuzzleHref}
          className="box-border flex flex-col p-3 rounded-xl bg-[var(--surfaceBg)] border border-[var(--borderColor)] hover:border-amber-500 hover:bg-amber-500/5 transition-all no-underline group"
        >
          <div className="box-border flex items-center justify-between mb-2">
            <span className="box-border text-lg leading-none">🧩</span>
            <span className="box-border shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Daily
            </span>
          </div>
          <span className="box-border text-xs font-bold text-[var(--foreground)] group-hover:text-amber-400 transition-colors mb-1">
            Daily Puzzle
          </span>
          <p className="box-border m-0 text-[11px] text-[var(--foreground)] opacity-75 mb-3 leading-snug">
            Today’s tactical puzzle challenge. Test your vision.
          </p>
          <span className="box-border mt-auto text-xs font-semibold text-amber-400 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Solve Puzzle →
          </span>
        </Link>

        {create960Href ? (
          <Link
            href={create960Href}
            className="box-border flex flex-col p-3 rounded-xl bg-[var(--surfaceBg)] border border-[var(--borderColor)] hover:border-purple-500 hover:bg-purple-500/5 transition-all no-underline group"
          >
            <div className="box-border flex items-center justify-between mb-2">
              <span className="box-border text-lg leading-none">🎲</span>
              <span className="box-border shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Random
              </span>
            </div>
            <span className="box-border text-xs font-bold text-[var(--foreground)] group-hover:text-purple-400 transition-colors mb-1">
              Chess960
            </span>
            <p className="box-border m-0 text-[11px] text-[var(--foreground)] opacity-75 mb-3 leading-snug">
              Fischer Random with 960 starting piece positions.
            </p>
            <span className="box-border mt-auto text-xs font-semibold text-purple-400 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Create 960 Room →
            </span>
          </Link>
        ) : null}

        <Link
          href={roomsHref}
          className="box-border flex flex-col p-3 rounded-xl bg-[var(--surfaceBg)] border border-[var(--borderColor)] hover:border-cyan-500 hover:bg-cyan-500/5 transition-all no-underline group"
        >
          <div className="box-border flex items-center justify-between mb-2">
            <span className="box-border text-lg leading-none">⚔️</span>
            <span className="box-border shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live
            </span>
          </div>
          <span className="box-border text-xs font-bold text-[var(--foreground)] group-hover:text-cyan-400 transition-colors mb-1">
            Lobby Browser
          </span>
          <p className="box-border m-0 text-[11px] text-[var(--foreground)] opacity-75 mb-3 leading-snug">
            Browse open challenges or create custom time controls.
          </p>
          <span className="box-border mt-auto text-xs font-semibold text-cyan-400 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View All Rooms →
          </span>
        </Link>
      </div>

      <div className="box-border flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 pt-2.5 border-t border-[var(--borderColor)]/40 text-[11px] text-[var(--foreground)] opacity-75 text-center">
        <span>3500+ Elo Stockfish</span>
        <span className="opacity-40">·</span>
        <span>0s Wait Time</span>
        <span className="opacity-40">·</span>
        <span>100% Free</span>
        <span className="opacity-40">·</span>
        <span>Zero Ads</span>
      </div>
    </div>
  );
}
