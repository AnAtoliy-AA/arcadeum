'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { cx } from '@arcadeum/ui/utils/cx';
import { GameSymbol } from '@/app/[locale]/home/components/featured-games/gameMeta';
import type { ActivityFeedActor } from '@/shared/api/activity';
import { useLanguage } from '@/shared/i18n/useLanguage';
import {
  FALLBACK_GAME_ACCENT,
  type ActivityGameMeta,
} from '../lib/activityGameMeta';
import {
  formatAbsoluteTime,
  formatRelativeTime,
  formatRatingDelta,
} from '../lib/formatActivityTime';
import { ActivityActorAvatar } from './ActivityActor';

/** Card shell: game-tinted left accent, compact padding, calm hover. */
export function ActivityCardShell({
  accent,
  labelledBy,
  testId,
  children,
}: {
  accent: string | null;
  labelledBy: string;
  testId: string;
  children: ReactNode;
}) {
  const style = {
    '--feed-accent': accent ?? FALLBACK_GAME_ACCENT,
  } as CSSProperties;
  return (
    <li className="list-none" data-testid={testId}>
      <article
        aria-labelledby={labelledBy}
        style={style}
        className={cx(
          'relative flex h-full items-start gap-3 overflow-hidden rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-3 pl-4',
          'transition-[border-color,background-color] duration-200 motion-reduce:transition-none',
          'hover:border-[var(--glassBorderHover)]',
          "before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-r-full before:bg-[var(--feed-accent)] before:content-['']",
        )}
      >
        {children}
      </article>
    </li>
  );
}

/** Player avatar with the game's own symbol as a small corner badge. */
export function ActivityAvatarWithGame({
  actor,
  game,
}: {
  actor: ActivityFeedActor;
  game: ActivityGameMeta | null;
}) {
  return (
    <span className="relative mt-0.5 shrink-0">
      <ActivityActorAvatar actor={actor} />
      {game && (
        <span
          aria-hidden
          className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-md border border-[var(--glassBorder)] bg-[var(--background)] text-[var(--feed-accent)]"
        >
          <GameSymbol gameId={game.id} className="h-3 w-3" />
        </span>
      )}
    </span>
  );
}

/** Relative time with the absolute time on hover (title) and in dateTime. */
export function ActivityTime({ timestamp }: { timestamp: string }) {
  const { locale } = useLanguage();
  return (
    <time
      dateTime={timestamp}
      title={formatAbsoluteTime(timestamp, locale)}
      className="whitespace-nowrap text-[11px] tabular-nums text-[var(--textSecondary)]"
    >
      {formatRelativeTime(timestamp, locale)}
    </time>
  );
}

export function RatingDelta({
  delta,
  label,
}: {
  delta: number;
  label: string;
}) {
  return (
    <span
      title={label}
      className={cx(
        'font-semibold tabular-nums',
        delta > 0 ? 'text-[var(--success)]' : 'text-[var(--textSecondary)]',
      )}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden>{formatRatingDelta(delta)}</span>
    </span>
  );
}

/** Compact secondary action (watch the replay or open the game). */
export function ActivityCardAction({
  href,
  label,
  ariaLabel,
  kind,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  kind: 'replay' | 'game';
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      data-testid={`activity-action-${kind}`}
      className={cx(
        'inline-flex min-h-[32px] items-center gap-1 rounded-full border border-[var(--glassBorder)] px-2.5 text-[11px] font-semibold text-[var(--textSecondary)]',
        'transition-colors duration-150 motion-reduce:transition-none',
        'hover:border-[var(--feed-accent)] hover:text-[var(--color)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]',
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill={kind === 'replay' ? 'currentColor' : 'none'}
        stroke={kind === 'replay' ? 'none' : 'currentColor'}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={kind === 'replay' ? 'M8 5.5v13l10.5-6.5L8 5.5z' : 'M9 6l6 6-6 6'}
        />
      </svg>
      {label}
    </Link>
  );
}

const DOT = '·';

/** Inline meta fragments joined by a middle dot. */
export function MetaLine({ parts }: { parts: ReactNode[] }) {
  const visible = parts.filter(
    (p) => p !== null && p !== undefined && p !== false && p !== '',
  );
  if (visible.length === 0) return null;
  return (
    <p className="m-0 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-[var(--textSecondary)]">
      {visible.map((p, i) => (
        <span key={i} className="inline-flex min-w-0 items-center gap-1.5">
          {i > 0 && <span aria-hidden>{DOT}</span>}
          {p}
        </span>
      ))}
    </p>
  );
}

/** Small round icon used for non-match events (achievement, level...). */
export function EventIcon({ path }: { path: string }) {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--glassBorder)] bg-[color:color-mix(in_srgb,var(--feed-accent)_14%,transparent)] text-[var(--feed-accent)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </span>
  );
}
