'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { getStreamJoinHost } from '../lib/streamConfig';
import type { OverlayModel } from '../lib/overlayModel';
import { MoveTimer } from './MoveTimer';
import { PlayerCard } from './PlayerCard';
import { StreamQr } from './StreamQr';

export interface BroadcastOverlayProps {
  /** Game title shown in the header, already resolved. */
  title: string;
  model: OverlayModel | null;
  joinUrl: string;
  /** Epoch ms of the last position change, for the move timer. */
  lastChangeAt: number;
  /** Diagnostics strip, only when `?debug=1`. */
  debug?: { connected: boolean; roomId: string; updates: number } | null;
  /** The board (game widget) rendered in the main panel. */
  children: ReactNode;
}

function StatusLine({
  model,
  lastChangeAt,
}: {
  model: OverlayModel | null;
  lastChangeAt: number;
}) {
  const { t } = useTranslation();

  if (!model || model.phase === 'waiting') {
    return <span>{t('pages.stream.statusWaiting')}</span>;
  }

  if (model.phase === 'finished') {
    const { outcome } = model;
    const text =
      outcome.kind === 'draw'
        ? t('pages.stream.draw')
        : outcome.kind === 'win'
          ? outcome.winnerNames.length > 1
            ? t('pages.stream.winners', {
                names: outcome.winnerNames.join(', '),
              })
            : t('pages.stream.winner', { name: outcome.winnerNames[0] })
          : t('pages.stream.statusFinished');
    return (
      <span data-testid="overlay-result" className="text-[var(--goldAccent)]">
        {text}
      </span>
    );
  }

  const active = model.players.find((p) => p.active);
  return (
    <span className="flex flex-col gap-[0.2cqw]">
      <span data-testid="overlay-turn">
        {active
          ? t('pages.stream.toMove', { name: active.name })
          : t('pages.stream.statusActive')}
      </span>
      <span
        data-testid="overlay-thinking"
        className="text-[1.15cqw] font-medium text-[var(--neutral)]"
      >
        {t('pages.stream.thinking')}...{' '}
        <MoveTimer key={lastChangeAt} since={lastChangeAt} />
      </span>
    </span>
  );
}

/**
 * HTML broadcast overlay. Everything here is plain DOM so the capture
 * pipeline only has to record the page. No backdrop-filter, no looping
 * animation: colours and borders change state, nothing moves.
 *
 * Content rules (legal): the only token mention is the small "ARC" label.
 * No price, yield or financial claim of any kind may be added here.
 */
export function BroadcastOverlay({
  title,
  model,
  joinUrl,
  lastChangeAt,
  debug,
  children,
}: BroadcastOverlayProps) {
  const { t } = useTranslation();
  const host = getStreamJoinHost(joinUrl);
  const chess = model?.gameId === 'chess_v1';

  return (
    <div
      data-testid="broadcast-overlay"
      className="absolute inset-0 grid grid-rows-[auto_minmax(0,1fr)] gap-[1.2cqw] px-[3cqw] py-[3cqw]"
    >
      <header className="flex items-center justify-between gap-[2cqw]">
        <div className="flex min-w-0 items-center gap-[1.4cqw]">
          <span
            data-testid="overlay-live"
            className="flex shrink-0 items-center gap-[0.6cqw] rounded-[0.5cqw] bg-[#dc2626] px-[1cqw] py-[0.3cqw] text-[1.3cqw] font-extrabold leading-tight tracking-wide text-white"
          >
            <span className="size-[0.7cqw] rounded-full bg-white" />
            {t('pages.stream.live')}
          </span>
          <h1
            data-testid="overlay-title"
            className="truncate text-[2.7cqw] font-extrabold leading-tight"
          >
            {title}
          </h1>
          <span
            data-testid="overlay-bot-badge"
            className="shrink-0 rounded-[0.5cqw] border border-[var(--accent)] px-[1cqw] py-[0.25cqw] text-[1.3cqw] font-bold uppercase leading-tight text-[var(--accent)]"
          >
            {t('pages.stream.botVsBot')}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-[1.4cqw] text-[1.3cqw] font-semibold text-[var(--neutral)]">
          {model?.moveCount != null ? (
            <span data-testid="overlay-moves">
              {t('pages.stream.moves', { count: model.moveCount })}
            </span>
          ) : null}
          <span
            data-testid="overlay-arc"
            className="rounded-[0.4cqw] border border-[var(--borderColor)] px-[0.7cqw] text-[1.15cqw] font-bold tracking-widest"
          >
            {t('pages.stream.arc')}
          </span>
        </div>
      </header>

      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_24cqw] gap-[1.6cqw]">
        <div
          data-testid="overlay-board"
          className="relative min-h-0 min-w-0 overflow-hidden rounded-[1.2cqw] border border-[var(--borderColor)] bg-[rgba(0,0,0,0.25)]"
        >
          {children}
        </div>

        <aside className="flex min-h-0 flex-col gap-[1cqw]">
          <div className="flex min-h-0 flex-1 flex-col gap-[0.8cqw]">
            {(model?.players ?? []).map((p) => (
              <PlayerCard key={p.id} player={p} chess={chess} />
            ))}
          </div>

          <div
            data-testid="overlay-status"
            className="shrink-0 rounded-[0.9cqw] border border-[var(--borderColor)] bg-[rgba(255,255,255,0.04)] px-[1.1cqw] py-[0.8cqw] text-[1.6cqw] font-bold leading-tight"
          >
            <StatusLine model={model} lastChangeAt={lastChangeAt} />
          </div>

          <div
            data-testid="overlay-cta"
            className="flex shrink-0 items-center gap-[1.1cqw] rounded-[0.9cqw] border border-[var(--accent)] bg-[rgba(56,189,248,0.1)] p-[0.9cqw]"
          >
            <StreamQr url={joinUrl} />
            <div className="min-w-0">
              <div className="text-[1.5cqw] font-extrabold leading-tight">
                {t('pages.stream.playAt', { host })}
              </div>
              <div className="text-[1.05cqw] leading-snug text-[var(--neutral)]">
                {t('pages.stream.scanToPlay')}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {debug ? (
        <div
          data-testid="stream-debug"
          className="absolute bottom-[0.6cqw] left-[0.8cqw] rounded bg-black/70 px-[0.8cqw] py-[0.2cqw] font-mono text-[0.95cqw] text-[#a3e635]"
        >
          room={debug.roomId} socket={debug.connected ? 'up' : 'down'} updates=
          {debug.updates}
          {debug.connected ? null : (
            <span
              data-testid="stream-reconnecting"
              className="ml-[0.8cqw] text-[#facc15]"
            >
              {t('pages.stream.reconnecting')}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
