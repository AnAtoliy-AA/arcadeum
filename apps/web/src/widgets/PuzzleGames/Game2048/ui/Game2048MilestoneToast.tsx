'use client';

import {
  GameMilestoneToast,
  type MilestoneTone,
} from '@/features/games/ui/GameMilestoneToast';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

interface Game2048MilestoneToastProps {
  milestone: number | null;
  onDismiss: () => void;
}

interface MilestoneTier {
  icon: string;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  tone: MilestoneTone;
  sparkles: string[];
}

function getTierConfig(milestone: number): MilestoneTier {
  if (milestone >= 8192) {
    return {
      icon: '🌌',
      badgeKey: 'games.game_2048_v1.milestone.badge_8192' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_8192' as TranslationKey,
      tone: 'cyan',
      sparkles: ['✨', '🌌', '⚡', '🌟'],
    };
  }

  if (milestone >= 4096) {
    return {
      icon: '💎',
      badgeKey: 'games.game_2048_v1.milestone.badge_4096' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_4096' as TranslationKey,
      tone: 'fuchsia',
      sparkles: ['✨', '💎', '🌟'],
    };
  }

  if (milestone >= 2048) {
    return {
      icon: '👑',
      badgeKey: 'games.game_2048_v1.milestone.badge_2048' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_2048' as TranslationKey,
      tone: 'yellow',
      sparkles: ['✨', '👑', '🎉'],
    };
  }

  if (milestone >= 1024) {
    return {
      icon: '🔥',
      badgeKey: 'games.game_2048_v1.milestone.badge_1024' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_1024' as TranslationKey,
      tone: 'orange',
      sparkles: [],
    };
  }

  if (milestone >= 512) {
    return {
      icon: '⚡',
      badgeKey: 'games.game_2048_v1.milestone.badge_512' as TranslationKey,
      titleKey: 'games.game_2048_v1.milestone.title_512' as TranslationKey,
      tone: 'amber',
      sparkles: [],
    };
  }

  return {
    icon: '⚡',
    badgeKey: 'games.game_2048_v1.milestone.badge' as TranslationKey,
    titleKey: 'games.game_2048_v1.milestone.title' as TranslationKey,
    tone: 'amber',
    sparkles: [],
  };
}

export function Game2048MilestoneToast({
  milestone,
  onDismiss,
}: Game2048MilestoneToastProps) {
  const { t } = useTranslation();

  if (milestone === null) return null;

  const tier = getTierConfig(milestone);
  const title = t(tier.titleKey) || t('games.game_2048_v1.milestone.title');
  const badge = t(tier.badgeKey) || t('games.game_2048_v1.milestone.badge');

  return (
    <GameMilestoneToast
      isOpen
      icon={tier.icon}
      badge={badge}
      title={title}
      description={t('games.game_2048_v1.milestone.body', { tile: milestone })}
      actionLabel={t('games.game_2048_v1.milestone.keepGoing')}
      onDismiss={onDismiss}
      tone={tier.tone}
      sparkles={tier.sparkles}
      dataTestId="game-2048-milestone-toast"
      actionTestId="game-2048-milestone-dismiss"
    />
  );
}
