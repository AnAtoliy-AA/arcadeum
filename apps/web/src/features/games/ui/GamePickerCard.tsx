'use client';

import { GamesCatalogRealPreview } from '@/app/[locale]/(app)/games/components/art/GamesCatalogRealPreview';
import { GameSymbol } from '@/app/[locale]/home/components/featured-games/gameMeta';
import { Spinner } from '@arcadeum/ui';

export interface GamePickerItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  genre: string;
  pace?: string;
  category: 'all' | 'board' | 'card' | 'casual' | 'puzzle';
  players: string;
  duration: string;
  isPlayable: boolean;
  isDemo?: boolean;
  landingHref?: string;
}

interface GamePickerCardProps {
  game: GamePickerItem;
  isLoading: boolean;
  disabled: boolean;
  onSelect: () => void;
  startingLabel: string;
  readyLabel?: string;
  demoBadgeLabel?: string;
  unavailableLabel?: string;
}

export function GamePickerCard({
  game,
  isLoading,
  disabled,
  onSelect,
  startingLabel,
  readyLabel = 'Ready',
  demoBadgeLabel = 'Demo',
  unavailableLabel = 'Disabled',
}: GamePickerCardProps) {
  const isCardDisabled = disabled || !game.isPlayable;

  return (
    <button
      type="button"
      onClick={() => {
        if (!isCardDisabled && !isLoading) {
          onSelect();
        }
      }}
      disabled={isCardDisabled || isLoading}
      data-testid={`game-picker-card-${game.id}`}
      className={`group box-border relative flex flex-col justify-between rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-xl overflow-hidden transition-all duration-300 text-left text-inherit ${
        isCardDisabled
          ? 'opacity-50 cursor-not-allowed'
          : isLoading
            ? 'cursor-wait opacity-90'
            : 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-[var(--primary)]/50 active:scale-[0.98]'
      }`}
    >
      <div className="box-border relative h-40 sm:h-44 w-full bg-slate-950 border-b border-[var(--borderColor)] overflow-hidden flex items-center justify-center">
        <div className="box-border absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-[2] pointer-events-none" />
        <div className="box-border absolute -inset-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-xl pointer-events-none" />

        <GameSymbol
          gameId={game.id}
          className="box-border absolute right-2 -bottom-4 w-28 h-28 opacity-10 text-white pointer-events-none transform rotate-12 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500 z-[1]"
          aria-hidden="true"
        />

        <div className="box-border relative z-[3] w-full h-full flex items-center justify-center p-2 scale-90 group-hover:scale-95 group-hover:brightness-105 transition-all duration-300">
          <GamesCatalogRealPreview gameId={game.slug} />
        </div>

        <div className="box-border absolute top-2.5 left-2.5 z-[4] flex items-center gap-1.5 pointer-events-none">
          <span className="box-border inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/80 text-white/95 text-[10px] font-semibold border border-white/20 backdrop-blur-md shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            {game.genre}
            {game.pace ? ` · ${game.pace}` : ''}
          </span>
        </div>

        <div className="box-border absolute top-2.5 right-2.5 z-[4] flex items-center gap-1.5 pointer-events-none">
          {isCardDisabled ? (
            <span className="box-border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/60 backdrop-blur-md shadow-md">
              {unavailableLabel}
            </span>
          ) : game.isDemo ? (
            <span className="box-border text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300/80 shadow-md">
              {demoBadgeLabel}
            </span>
          ) : (
            <span className="box-border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 backdrop-blur-md">
              {readyLabel}
            </span>
          )}
        </div>

        <div className="box-border absolute bottom-2.5 right-2.5 z-[4] flex items-center gap-1 pointer-events-none">
          <span className="box-border text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/80 text-white/90 border border-white/10 backdrop-blur-md">
            ⏱ {game.duration}
          </span>
        </div>

        {isLoading && (
          <div className="box-border absolute inset-0 z-[10] bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white animate-fade-in">
            <Spinner size="md" />
            <span className="text-xs font-semibold tracking-wide text-white/90">
              {startingLabel}
            </span>
          </div>
        )}
      </div>

      <div className="box-border p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="box-border flex flex-col gap-1">
          <h3 className="box-border m-0 text-base font-bold text-[var(--color)] group-hover:text-[var(--primary)] transition-colors truncate">
            {game.name}
          </h3>
          <p className="box-border m-0 text-xs text-[var(--color)] opacity-75 line-clamp-2 leading-relaxed min-h-[2rem]">
            {game.description}
          </p>
        </div>

        <div className="box-border flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--borderColor)]">
          <span className="box-border inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--color)]/5 text-[var(--color)] border border-[var(--borderColor)]">
            👥 {game.players}
          </span>
          {game.players === '1' ? (
            <span className="box-border inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--color)]/5 text-[var(--color)] border border-[var(--borderColor)]">
              🧩 Solo
            </span>
          ) : (
            <span className="box-border inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--color)]/5 text-[var(--color)] border border-[var(--borderColor)]">
              🤖 AI Bot
            </span>
          )}
          <span className="box-border inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 font-semibold">
            ⚡ Quick Play
          </span>
        </div>
      </div>
    </button>
  );
}
