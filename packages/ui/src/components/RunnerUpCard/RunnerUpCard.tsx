import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type RunnerUpCardProps = {
  place: 2 | 3;
  name: string;
  rating: number;
  wins: number;
  winrate: number;
  region?: string;
  placeLabel?: string;
  testID?: string;
  'data-testid'?: string;
  /** Optional avatar slot — designed for `<EquippedPlayerAvatar size="sm" />`. */
  avatar?: ReactNode;
  className?: string;
};

const MEDAL_BY_PLACE: Record<2 | 3, string> = { 2: '🥈', 3: '🥉' };

const CardClasses = [
  '',
  'flex',
  'min-w-[200px]',
  'flex-col',
  'gap-2',
  'rounded-2xl',
  'border',
  'border-[var(--borderColor)]',
  'bg-[rgba(255,255,255,0.02)]',
  'p-4',
].join(' ');

export function RunnerUpCard({
  place,
  name,
  rating,
  wins,
  winrate,
  region,
  placeLabel,
  testID,
  'data-testid': dataTestId,
  avatar,
  className,
}: RunnerUpCardProps) {
  return (
    <div
      data-testid={dataTestId ?? testID ?? `runner-up-${place}`}
      className={cx(CardClasses, className)}
    >
      <div className="flex flex-row items-center gap-2">
        {avatar}
        <span className="text-[24px]">{MEDAL_BY_PLACE[place]}</span>
        <span className="text-[12px] uppercase tracking-[2px] opacity-[0.7]">
          {placeLabel ?? (place === 2 ? 'Runner · Up' : '3rd · Place')}
        </span>
      </div>
      <span className="line-clamp-1 text-[20px] font-extrabold">{name}</span>
      <div className="flex flex-row flex-wrap items-center gap-3">
        <span className="text-[16px] font-bold tracking-[1px]">
          {rating.toLocaleString()}
        </span>
        <span className="h-3 w-px bg-[var(--borderColor)]" />
        <span className="text-[14px] opacity-[0.8]">{wins} W</span>
        <span className="text-[14px] opacity-[0.8]">
          {Math.round(winrate * 100)}% WR
        </span>
        {region ? (
          <span className="text-[14px] opacity-[0.6]">· {region}</span>
        ) : null}
      </div>
    </div>
  );
}
