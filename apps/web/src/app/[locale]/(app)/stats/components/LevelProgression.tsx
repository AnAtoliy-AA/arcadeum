'use client';

import { useState } from 'react';
import { Card, Button, CosmeticSprite } from '@arcadeum/ui';
import { xpForLevel } from '@/shared/lib/xp-level';
import {
  getRewardForLevel,
  getCoinsForLevel,
  type LevelBadgeReward,
} from '@/shared/lib/level-rewards';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { useMilestoneBadgeEquip } from '../hooks/useMilestoneBadgeEquip';

interface LevelRewardCellProps {
  reward: LevelBadgeReward;
  level: number;
  isUnlocked: boolean;
  isLoggedIn: boolean;
  equippedBadgeId?: string | null;
  pendingBadgeId: string | null;
  handleEquip: (badgeId: string) => Promise<void>;
  handleUnequip: () => Promise<void>;
}

function LevelRewardCell({
  reward,
  level,
  isUnlocked,
  isLoggedIn,
  equippedBadgeId,
  pendingBadgeId,
  handleEquip,
  handleUnequip,
}: LevelRewardCellProps) {
  const { t } = useTranslation();
  const isEquipped = equippedBadgeId === reward.badgeId;

  return (
    <div
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--borderColor)] bg-[var(--surfaceSecondary)] shadow-sm"
      data-testid={`level-reward-${level}`}
    >
      <CosmeticSprite src={reward.assetUrl} alt={reward.badgeId} size={20} />
      <span className="text-[11px] font-semibold text-[var(--color)]">
        {t(`pages.shop.${reward.nameKey}` as TranslationKey)}
      </span>
      {isUnlocked ? (
        <>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            {t('stats.unlocked' as TranslationKey)}
          </span>
          {isLoggedIn &&
            (isEquipped ? (
              <button
                type="button"
                disabled={pendingBadgeId === 'unequip'}
                onClick={handleUnequip}
                data-testid={`level-equip-btn-${level}`}
                className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-bold hover:bg-emerald-500/40 cursor-pointer transition-colors border border-emerald-500/40"
              >
                {pendingBadgeId === 'unequip'
                  ? '...'
                  : `✓ ${t('stats.equipped' as TranslationKey)}`}
              </button>
            ) : (
              <button
                type="button"
                disabled={pendingBadgeId === reward.badgeId}
                onClick={() => handleEquip(reward.badgeId)}
                data-testid={`level-equip-btn-${level}`}
                className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--primary)] text-white font-bold hover:opacity-90 cursor-pointer transition-opacity shadow-sm"
              >
                {pendingBadgeId === reward.badgeId
                  ? '...'
                  : t('stats.equip' as TranslationKey)}
              </button>
            ))}
        </>
      ) : (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--surfaceTertiary)] text-[var(--textSecondary)] font-medium">
          {t('stats.locked' as TranslationKey)}
        </span>
      )}
    </div>
  );
}

export function LevelProgression({ currentLevel }: { currentLevel: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const {
    equippedBadgeId,
    pendingBadgeId,
    handleEquip,
    handleUnequip,
    isLoggedIn,
  } = useMilestoneBadgeEquip();

  const rows = Array.from({ length: 99 }, (_, i) => {
    const level = i + 1;
    const totalXp = xpForLevel(level);
    const gap = level > 1 ? totalXp - xpForLevel(level - 1) : totalXp;
    const isCurrent = level === currentLevel;
    const isPast = level < currentLevel;
    const reward = getRewardForLevel(level);
    const coinAmount = getCoinsForLevel(level);
    return { level, totalXp, gap, isCurrent, isPast, reward, coinAmount };
  });

  const visibleRows = expanded ? rows : rows.slice(0, 10);

  return (
    <Card
      variant="glass"
      padding="md"
      className="flex flex-col gap-4 border-[var(--borderColor)] shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🗺️</span>
          <h3 className="text-[17px] font-bold tracking-tight text-[var(--color)]">
            {t('stats.levelProgression' as TranslationKey)}
          </h3>
        </div>

        <Button
          variant="chip"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-[12px] font-medium text-[var(--textSecondary)]"
        >
          {expanded
            ? t('stats.levelProgressionShowLess' as TranslationKey)
            : t('stats.levelProgressionShowAll' as TranslationKey)}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--borderColor)]/50 bg-[var(--surfaceSecondary)]/50">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[var(--textSecondary)] border-b border-[var(--borderColor)] bg-[var(--surfaceTertiary)]/30 text-[11px] uppercase tracking-wider">
              <th className="text-left py-2.5 px-3 font-bold">
                {t('stats.level' as TranslationKey)}
              </th>
              <th className="text-right py-2.5 px-3 font-bold">
                {t('stats.totalXP' as TranslationKey)}
              </th>
              <th className="text-right py-2.5 px-3 font-bold">
                {t('stats.xpNeeded' as TranslationKey)}
              </th>
              <th className="text-right py-2.5 px-3 font-bold">
                {t('stats.coins' as TranslationKey)}
              </th>
              <th className="text-left py-2.5 px-4 font-bold">
                {t('stats.reward' as TranslationKey)}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--borderColor)]/40">
            {visibleRows.map((row) => (
              <tr
                key={row.level}
                className={`transition-colors ${
                  row.isCurrent
                    ? 'bg-violet-500/15 font-bold text-violet-200'
                    : row.isPast
                      ? 'text-[var(--textSecondary)] hover:bg-[var(--surfaceHover)]/50'
                      : 'hover:bg-[var(--surfaceHover)]/50'
                }`}
              >
                <td className="py-2 px-3">
                  <div className="inline-flex items-center gap-1.5">
                    <span
                      className={`font-mono ${
                        row.isCurrent
                          ? 'text-violet-300 font-extrabold text-[13px]'
                          : ''
                      }`}
                    >
                      {row.level}
                    </span>
                    {row.isCurrent && (
                      <span className="px-1.5 py-0.5 rounded-full bg-violet-500/30 text-violet-300 text-[9px] font-extrabold tracking-wide uppercase border border-violet-500/50 animate-pulse">
                        {t('stats.youBadge' as TranslationKey)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-right py-2 px-3 font-mono">
                  {row.totalXp.toLocaleString()}
                </td>
                <td className="text-right py-2 px-3 font-mono text-[var(--textSecondary)]">
                  {row.gap.toLocaleString()}
                </td>
                <td
                  className="text-right py-2 px-3 font-semibold text-amber-400 font-mono"
                  data-testid={`level-coins-${row.level}`}
                >
                  +{row.coinAmount.toLocaleString()} 🪙
                </td>
                <td className="py-2 px-4">
                  {row.reward ? (
                    <LevelRewardCell
                      reward={row.reward}
                      level={row.level}
                      isUnlocked={row.isPast || row.isCurrent}
                      isLoggedIn={isLoggedIn}
                      equippedBadgeId={equippedBadgeId}
                      pendingBadgeId={pendingBadgeId}
                      handleEquip={handleEquip}
                      handleUnequip={handleUnequip}
                    />
                  ) : (
                    <span className="text-[var(--textTertiary)] opacity-25">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
