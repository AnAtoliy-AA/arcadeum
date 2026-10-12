'use client';

import {
  GameMilestoneToast,
  type MilestoneTone,
} from '@/features/games/ui/GameMilestoneToast';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

interface SudokuMilestoneToastProps {
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
  if (milestone >= 75) {
    return {
      icon: '🔥',
      badgeKey: 'games.sudoku_v1.milestone.badge_75' as TranslationKey,
      titleKey: 'games.sudoku_v1.milestone.title_75' as TranslationKey,
      bodyKey: 'games.sudoku_v1.milestone.body_75' as TranslationKey,
      tone: 'yellow',
      sparkles: ['✨', '🔥', '⚡'],
    };
  }

  return {
    icon: '🧩',
    badgeKey: 'games.sudoku_v1.milestone.badge_50' as TranslationKey,
    titleKey: 'games.sudoku_v1.milestone.title_50' as TranslationKey,
    bodyKey: 'games.sudoku_v1.milestone.body_50' as TranslationKey,
    tone: 'amber',
    sparkles: ['✨', '🧩'],
  };
}

export function SudokuMilestoneToast({
  milestone,
  onDismiss,
}: SudokuMilestoneToastProps) {
  const { t } = useTranslation();

  if (milestone === null) return null;

  const tier = getTierConfig(milestone);
  const title = t(tier.titleKey) || t('games.sudoku_v1.milestone.title');
  const badge = t(tier.badgeKey) || t('games.sudoku_v1.milestone.badge');
  const description = t(tier.bodyKey) || t('games.sudoku_v1.milestone.body_50');

  return (
    <GameMilestoneToast
      isOpen
      icon={tier.icon}
      badge={badge}
      title={title}
      description={description}
      actionLabel={t('games.sudoku_v1.milestone.keepGoing')}
      onDismiss={onDismiss}
      tone={tier.tone}
      sparkles={tier.sparkles}
      dataTestId="sudoku-milestone-toast"
      actionTestId="sudoku-milestone-dismiss"
    />
  );
}
