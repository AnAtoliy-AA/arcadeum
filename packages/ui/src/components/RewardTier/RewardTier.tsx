import { RankBadge, type RankBadgeTier } from '../RankBadge/RankBadge';
import { cx } from '../../utils/cx';

export type RewardTierProps = {
  tier: RankBadgeTier;
  rankFrom: number;
  rankTo: number;
  rewardText: string;
  className?: string;
};

const RootClasses = [
  'box-border',
  'flex',
  'flex-row',
  'items-center',
  'justify-between',
  'gap-3',
  'rounded-xl',
  'border',
  'border-[var(--borderColor)]',
  'bg-[rgba(255,255,255,0.02)]',
  'px-4',
  'py-3',
].join(' ');

export function RewardTier({
  tier,
  rankFrom,
  rankTo,
  rewardText,
  className,
}: RewardTierProps) {
  const rangeLabel =
    rankFrom === rankTo ? `#${rankFrom}` : `#${rankFrom}–${rankTo}`;
  return (
    <div className={cx(RootClasses, className)}>
      <div className="flex flex-row items-center gap-3">
        <RankBadge tier={tier}>{rangeLabel}</RankBadge>
        <span className="text-[16px] font-semibold capitalize">{tier}</span>
      </div>
      <div className="flex flex-1 flex-col items-end">
        <span className="text-right text-[14px] opacity-[0.85]">
          {rewardText}
        </span>
      </div>
    </div>
  );
}
