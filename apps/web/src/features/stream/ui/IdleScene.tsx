'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { gameMetadata } from '@/features/games/registry';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { getStreamJoinHost, getStreamJoinUrl } from '../lib/streamConfig';
import type { OverlayOptions } from '../lib/streamConfig';
import { StreamFrame } from './StreamFrame';
import { StreamGlobalStyles } from './StreamGlobalStyles';
import { StreamQr } from './StreamQr';

interface GameMeta {
  name: string;
  description?: string;
  thumbnail?: string;
}

function metaFor(gameId: string | null): GameMeta | null {
  if (!gameId) return null;
  return (gameMetadata as Record<string, GameMeta | undefined>)[gameId] ?? null;
}

/** Whole seconds left until `deadline`, never below zero. */
export function secondsLeft(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export interface IdleSceneProps {
  nextGameId: string | null;
  lastGameId: string | null;
  result: string;
  seconds: number;
  debug: boolean;
  overlay?: OverlayOptions;
}

/**
 * Between-games scene: `/{locale}/stream/idle`.
 *
 * Shows the last result, a countdown to the next game with a preview card,
 * and the join QR. The director opens it with `next`, `seconds`, `last` and
 * `result` query params, all validated on the server before they get here.
 */
export function IdleScene({
  nextGameId,
  lastGameId,
  result,
  seconds,
  debug,
  overlay,
}: IdleSceneProps) {
  const { t } = useTranslation();
  const joinUrl = useMemo(
    () => overlay?.joinUrl ?? getStreamJoinUrl(),
    [overlay?.joinUrl],
  );
  const showCta = overlay?.parts.cta !== false;
  const showArc = overlay?.parts.arc !== false;
  const banner = overlay?.banner ?? '';
  const host = getStreamJoinHost(joinUrl);
  const next = metaFor(nextGameId);
  const last = metaFor(lastGameId);

  const [deadline] = useState(() => Date.now() + seconds * 1000);
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const tick = () => setLeft(secondsLeft(deadline, Date.now()));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <StreamFrame testId="idle-frame">
      <StreamGlobalStyles />
      <div
        data-testid="idle-scene"
        className="absolute inset-0 grid grid-rows-[auto_minmax(0,1fr)_auto] gap-[2cqw] px-[3cqw] py-[3cqw]"
      >
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-[1.4cqw]">
            <span className="flex items-center gap-[0.6cqw] rounded-[0.5cqw] bg-[#dc2626] px-[1cqw] py-[0.3cqw] text-[1.3cqw] font-extrabold text-white">
              <span className="size-[0.7cqw] rounded-full bg-white" />
              {t('pages.stream.live')}
            </span>
            <h1 className="text-[2.7cqw] font-extrabold">
              {t('pages.stream.idle.title')}
            </h1>
            <span
              data-testid="idle-bot-badge"
              className="rounded-[0.5cqw] border border-[var(--accent)] px-[1cqw] py-[0.25cqw] text-[1.3cqw] font-bold uppercase text-[var(--accent)]"
            >
              {t('pages.stream.botVsBot')}
            </span>
          </div>
          {showArc ? (
            <span className="rounded-[0.4cqw] border border-[var(--borderColor)] px-[0.7cqw] text-[1.15cqw] font-bold tracking-widest text-[var(--neutral)]">
              {t('pages.stream.arc')}
            </span>
          ) : null}
        </header>

        <div className="grid min-h-0 grid-cols-2 gap-[3cqw]">
          <section
            data-testid="idle-last"
            className="flex min-h-0 flex-col justify-center gap-[1cqw] rounded-[1.2cqw] border border-[var(--borderColor)] bg-[rgba(255,255,255,0.04)] p-[2.4cqw]"
          >
            <div className="text-[1.4cqw] font-semibold uppercase tracking-wider text-[var(--neutral)]">
              {t('pages.stream.idle.lastResult')}
            </div>
            {last || result ? (
              <>
                {last ? (
                  <div className="text-[2.6cqw] font-extrabold leading-tight">
                    {last.name}
                  </div>
                ) : null}
                {result ? (
                  <div
                    data-testid="idle-result"
                    className="text-[2.2cqw] font-bold leading-snug text-[var(--goldAccent)]"
                  >
                    {result}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-[2.2cqw] font-bold leading-snug">
                {t('pages.stream.idle.noResult')}
              </div>
            )}
          </section>

          <section
            data-testid="idle-next"
            className="flex min-h-0 flex-col justify-center gap-[1.2cqw] rounded-[1.2cqw] border border-[var(--accent)] bg-[rgba(56,189,248,0.1)] p-[2.4cqw]"
          >
            <div className="text-[1.4cqw] font-semibold uppercase tracking-wider text-[var(--accent)]">
              {t('pages.stream.idle.upNext')}
            </div>
            <div className="flex items-center gap-[1.8cqw]">
              {next?.thumbnail ? (
                <div className="relative size-[11cqw] shrink-0 overflow-hidden rounded-[1cqw] bg-[rgba(255,255,255,0.06)]">
                  <Image
                    src={next.thumbnail}
                    alt=""
                    fill
                    sizes="12vw"
                    unoptimized
                    priority
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0">
                <div
                  data-testid="idle-next-title"
                  className="text-[3.2cqw] font-extrabold leading-tight"
                >
                  {next?.name ?? t('pages.stream.idle.comingUp')}
                </div>
                {next?.description ? (
                  <div className="mt-[0.4cqw] line-clamp-2 text-[1.4cqw] leading-snug text-[var(--neutral)]">
                    {next.description}
                  </div>
                ) : (
                  <div className="mt-[0.4cqw] text-[1.4cqw] text-[var(--neutral)]">
                    {t('pages.stream.idle.botsLoading')}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-[1cqw]">
              <span className="text-[1.6cqw] font-semibold text-[var(--neutral)]">
                {t('pages.stream.idle.startingIn')}
              </span>
              <span
                data-testid="idle-countdown"
                className="text-[5cqw] font-extrabold tabular-nums leading-none"
              >
                {t('pages.stream.idle.seconds', { n: left })}
              </span>
            </div>
          </section>
        </div>

        <footer
          data-testid="idle-cta"
          className="flex items-center justify-center gap-[1.6cqw]"
        >
          {showCta ? (
            <>
              {overlay?.showQr === false ? null : (
                <StreamQr
                  url={joinUrl}
                  sizeClass="size-[8cqw]"
                  testId="idle-qr"
                />
              )}
              <div>
                <div className="text-[2.2cqw] font-extrabold">
                  {t('pages.stream.playAt', { host })}
                </div>
                <div className="text-[1.4cqw] text-[var(--neutral)]">
                  {t('pages.stream.playFree')}
                </div>
              </div>
            </>
          ) : null}
          {banner ? (
            <div
              data-testid="idle-banner"
              className="rounded-[0.9cqw] border border-[var(--goldAccent)] px-[1.4cqw] py-[0.8cqw] text-[1.8cqw] font-bold text-[var(--goldAccent)]"
            >
              {banner}
            </div>
          ) : null}
        </footer>

        {debug ? (
          <div
            data-testid="stream-debug"
            className="absolute bottom-[0.6cqw] left-[0.8cqw] rounded bg-black/70 px-[0.8cqw] py-[0.2cqw] font-mono text-[0.95cqw] text-[#a3e635]"
          >
            next={nextGameId ?? '-'} last={lastGameId ?? '-'} left={left}
          </div>
        ) : null}
      </div>
    </StreamFrame>
  );
}
