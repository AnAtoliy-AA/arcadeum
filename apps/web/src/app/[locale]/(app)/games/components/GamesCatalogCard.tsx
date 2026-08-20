'use client';

import Link from 'next/link';
import { GamesCatalogRealPreview } from './art/GamesCatalogRealPreview';
import { GameSymbol } from '@/app/[locale]/home/components/featured-games/gameMeta';
import type { CatalogGameItem } from '../GamesCatalogClient';

interface GamesCatalogCardProps {
  game: CatalogGameItem;
  playLabel?: string;
  demoBadgeLabel?: string;
  unavailableLabel?: string;
  detailsLabel?: string;
}

function PlayIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="6 4 20 12 6 20" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function GamesCatalogCard({
  game,
  playLabel = 'Play Now',
  demoBadgeLabel = 'Demo',
  unavailableLabel = 'Disabled',
  detailsLabel = 'Rules',
}: GamesCatalogCardProps) {
  const isDisabled = !game.isPlayable;
  const ctaText = isDisabled
    ? unavailableLabel
    : game.isDemo
      ? 'Try Demo'
      : playLabel;

  return (
    <article
      data-testid={`games-catalog-card-${game.id}`}
      className={`group box-border relative flex flex-col justify-between rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-white/30 ${
        isDisabled ? 'opacity-70' : ''
      }`}
    >
      <div className="box-border relative h-52 w-full bg-black/60 border-b border-[var(--borderColor)] overflow-hidden flex items-center justify-center">
        <div className="box-border absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-[2] pointer-events-none" />

        <div className="box-border absolute -inset-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-xl pointer-events-none" />

        <GameSymbol
          gameId={game.id}
          className="box-border absolute right-2 -bottom-4 w-32 h-32 opacity-10 text-white pointer-events-none transform rotate-12 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500 z-[1]"
          aria-hidden="true"
        />

        <div className="box-border relative z-[3] w-full h-full flex items-center justify-center p-2 scale-95 group-hover:scale-100 group-hover:brightness-105 transition-all duration-300">
          <GamesCatalogRealPreview gameId={game.slug} />
        </div>

        <div className="box-border absolute top-3 left-3 z-[4] flex items-center gap-1.5">
          <span className="box-border inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 text-white/95 text-[11px] font-semibold border border-white/20 backdrop-blur-md shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            {game.genre}
            {game.pace ? ` · ${game.pace}` : ''}
          </span>
        </div>

        <div className="box-border absolute top-3 right-3 z-[4] flex items-center gap-1.5">
          {isDisabled ? (
            <span className="box-border text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/60 backdrop-blur-md shadow-md">
              {unavailableLabel}
            </span>
          ) : game.isDemo ? (
            <span className="box-border text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 border border-amber-300/80 shadow-md">
              {demoBadgeLabel}
            </span>
          ) : (
            <span className="box-border text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 backdrop-blur-md">
              Ready
            </span>
          )}
        </div>

        <div className="box-border absolute bottom-3 right-3 z-[4] flex items-center gap-1">
          <span className="box-border text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/70 text-white/80 border border-white/10 backdrop-blur-md">
            ⏱ {game.duration}
          </span>
        </div>
      </div>

      <div className="box-border p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="box-border flex flex-col gap-2">
          <div className="box-border flex items-center justify-between gap-2">
            <Link
              href={game.landingHref}
              className="box-border text-xl font-bold text-white group-hover:text-[var(--primary)] transition-colors no-underline truncate"
            >
              {game.name}
            </Link>
          </div>

          <p className="box-border m-0 text-xs sm:text-sm text-white/75 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {game.description}
          </p>

          <div className="box-border flex flex-wrap items-center gap-2 pt-1">
            <span className="box-border inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/5 text-white/90 border border-white/10">
              👥 {game.players}
            </span>
            <span className="box-border inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/5 text-white/90 border border-white/10">
              🤖 AI Bots
            </span>
            <span className="box-border inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/5 text-white/90 border border-white/10">
              ⚡ Instant
            </span>
          </div>
        </div>

        <div className="box-border flex items-center gap-2 pt-2 border-t border-[var(--borderColor)]">
          <Link
            href={isDisabled ? '#' : game.landingHref}
            aria-disabled={isDisabled}
            className={`box-border flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold no-underline transition-all shadow-md ${
              isDisabled
                ? 'bg-white/10 text-white/40 cursor-not-allowed pointer-events-none'
                : 'bg-[linear-gradient(135deg,var(--primary),#3b82f6)] text-white hover:brightness-110 hover:shadow-lg active:scale-[0.98]'
            }`}
            data-testid={`game-card-play-${game.id}`}
          >
            <PlayIcon />
            <span>{ctaText}</span>
          </Link>

          <Link
            href={`${game.landingHref}#how-to-play`}
            className="box-border inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-white/90 border border-white/15 hover:bg-white/15 hover:text-white transition-all no-underline shadow-sm whitespace-nowrap"
            title={`${detailsLabel} - ${game.name}`}
            aria-label={`${detailsLabel} for ${game.name}`}
            data-testid={`game-card-rules-${game.id}`}
          >
            <BookIcon />
            <span>{detailsLabel}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
