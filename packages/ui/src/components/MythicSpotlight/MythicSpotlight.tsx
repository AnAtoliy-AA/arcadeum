'use client';
import type { ReactNode } from 'react';
import { Button } from '../Button/Button';
import { RankBadge } from '../RankBadge/RankBadge';
import { MythicPortrait } from '../MythicPortrait/MythicPortrait';
import { FormPips, type FormResult } from '../FormPips/FormPips';
import { cx } from '../../utils/cx';

export type MythicSpotlightProps = {
  rank: number;
  name: string;
  rating: number;
  ratingDelta: number;
  streak: number;
  region?: string;
  recentForm?: FormResult[];
  streakLabel?: string;
  leadLabel?: string;
  recentLabel?: string;
  challengeLabel?: string;
  watchLabel?: string;
  followLabel?: string;
  /** Rich portrait slot — when provided, replaces the default initials
   *  monogram. Designed for `<EquippedPlayerAvatar size="card" />`. */
  portrait?: ReactNode;
  onChallenge?: () => void;
  onWatch?: () => void;
  onFollow?: () => void;
  className?: string;
};

const GlowClasses = 'pointer-events-none absolute -inset-20';

const CardClasses = [
  '',
  'relative',
  'flex',
  'flex-col',
  'gap-4',
  'overflow-hidden',
  'rounded-3xl',
  'border',
  'border-[rgba(236,72,153,0.4)]',
  'bg-[rgba(15,12,25,0.7)]',
  'p-5',
].join(' ');

const StatTileClasses = [
  '',
  'flex',
  'min-w-[96px]',
  'flex-col',
  'gap-[2px]',
  'rounded-lg',
  'border',
  'border-[var(--borderColor)]',
  'bg-[rgba(255,255,255,0.02)]',
  'px-3',
  'py-2',
].join(' ');

export function MythicSpotlight({
  rank,
  name,
  rating,
  ratingDelta,
  streak,
  region,
  recentForm = [],
  streakLabel = `${streak}-game streak`,
  leadLabel = `+${ratingDelta} over #2`,
  recentLabel = 'Last 12 matches',
  challengeLabel = '⚔ Challenge',
  watchLabel = '▶ Watch replay',
  followLabel = 'Follow',
  portrait,
  onChallenge,
  onWatch,
  onFollow,
  className,
}: MythicSpotlightProps) {
  return (
    <div data-testid="leaderboard-mythic-spotlight" className={cx(CardClasses, className)}>
      <div
        className={GlowClasses}
        style={{
          background:
            'radial-gradient(closest-side, rgba(236,72,153,0.35), rgba(236,72,153,0))',
          filter: 'blur(40px)',
        }}
      />
      <div className="flex flex-row flex-wrap items-center gap-5">
        {portrait ?? <MythicPortrait monogram={name} />}
        <div className="flex min-w-[240px] flex-1 flex-col gap-2">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <RankBadge tier="mythic">{`#${rank}`}</RankBadge>
            <span className="text-[14px] font-bold tracking-[2px] text-[var(--mythicAccent)]">
              MYTHIC
            </span>
            <div className="flex flex-row items-center gap-1 rounded-full border border-[rgba(251,146,60,0.4)] bg-[rgba(251,146,60,0.12)] px-2 py-0.5">
              <span className="text-[14px]">🔥</span>
              <span className="text-[14px] font-bold text-[#fb923c]">
                {streak}
              </span>
            </div>
            {region ? (
              <span className="text-[14px] opacity-[0.6]">· {region}</span>
            ) : null}
          </div>
          <span className="text-[40px] font-extrabold tracking-[-0.5px]">
            {name}
          </span>
          <div className="flex flex-row flex-wrap items-center gap-3">
            <span className="text-[20px] font-bold tracking-[1px]">
              {rating.toLocaleString()}
            </span>
            <span className="text-[16px] opacity-[0.75]">{leadLabel}</span>
            <span className="text-[16px] opacity-[0.75]">· {streakLabel}</span>
          </div>
        </div>
      </div>

      {recentForm.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] uppercase tracking-[2px] opacity-[0.6]">
            {recentLabel}
          </span>
          <FormPips results={recentForm} max={12} variant="letter" />
        </div>
      ) : null}

      <div className="flex flex-row flex-wrap gap-3">
        <div className={StatTileClasses}>
          <span className="text-[12px] uppercase opacity-[0.6]">Rating</span>
          <span className="text-[18px] font-bold tracking-[1px]">
            {rating.toLocaleString()}
          </span>
        </div>
        <div className={StatTileClasses}>
          <span className="text-[12px] uppercase opacity-[0.6]">Streak</span>
          <span className="text-[18px] font-bold tracking-[1px]">
            {streak}
          </span>
        </div>
        <div className={StatTileClasses}>
          <span className="text-[12px] uppercase opacity-[0.6]">Lead</span>
          <span className="text-[18px] font-bold tracking-[1px]">
            +{ratingDelta}
          </span>
        </div>
      </div>

      <div className="flex flex-row flex-wrap gap-3">
        {onChallenge ? (
          <Button
            variant="ghost"
            onClick={onChallenge}
            data-testid="mythic-challenge"
            aria-label={challengeLabel}
            style={{
              borderColor: 'var(--mythicAccent)',
              backgroundColor: 'rgba(236,72,153,0.18)',
              color: 'var(--mythicAccent)',
            }}
          >
            {challengeLabel}
          </Button>
        ) : null}
        {onWatch ? (
          <Button
            variant="ghost"
            onClick={onWatch}
            data-testid="mythic-watch"
            aria-label={watchLabel}
          >
            {watchLabel}
          </Button>
        ) : null}
        {onFollow ? (
          <Button
            variant="ghost"
            onClick={onFollow}
            data-testid="mythic-follow"
            aria-label={followLabel}
          >
            {followLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
