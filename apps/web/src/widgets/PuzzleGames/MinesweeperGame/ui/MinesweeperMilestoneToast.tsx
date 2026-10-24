'use client';

import {
  GameMilestoneToast,
  type MilestoneTone,
} from '@/features/games/ui/GameMilestoneToast';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

interface MinesweeperMilestoneToastProps {
  milestone: number | null;
  onDismiss: () => void;
}

interface MilestoneTier {
  icon: string;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  tone: MilestoneTone;
  sparkles: string[];
}

function getTierConfig(milestone: number): MilestoneTier {
  if (milestone >= 80) {
    return {
      icon: '⚡',
      badgeKey: 'games.minesweeper_v1.milestone.badge_80' as TranslationKey,
      titleKey: 'games.minesweeper_v1.milestone.title_80' as TranslationKey,
      bodyKey: 'games.minesweeper_v1.milestone.body_80' as TranslationKey,
      tone: 'orange',
      sparkles: ['✨', '⚡', '💣'],
    };
  }

  return {
    icon: '🧭',
    badgeKey: 'games.minesweeper_v1.milestone.badge_50' as TranslationKey,
    titleKey: 'games.minesweeper_v1.milestone.title_50' as TranslationKey,
    bodyKey: 'games.minesweeper_v1.milestone.body_50' as TranslationKey,
    tone: 'emerald',
    sparkles: ['✨', '🧭'],
  };
}

export function MinesweeperMilestoneToast({
  milestone,
  onDismiss,
}: MinesweeperMilestoneToastProps) {
  const { t } = useTranslation();

  if (milestone === null) return null;

  const tier = getTierConfig(milestone);
  const title = t(tier.titleKey) || t('games.minesweeper_v1.milestone.title');
  const badge = t(tier.badgeKey) || t('games.minesweeper_v1.milestone.badge');
  const description =
    t(tier.bodyKey) || t('games.minesweeper_v1.milestone.body_50');

  return (
    <GameMilestoneToast
      isOpen
      icon={tier.icon}
      badge={badge}
      title={title}
      description={description}
      actionLabel={t('games.minesweeper_v1.milestone.keepGoing')}
      onDismiss={onDismiss}
      tone={tier.tone}
      sparkles={tier.sparkles}
      dataTestId="minesweeper-milestone-toast"
      actionTestId="minesweeper-milestone-dismiss"
    />
  );
}
