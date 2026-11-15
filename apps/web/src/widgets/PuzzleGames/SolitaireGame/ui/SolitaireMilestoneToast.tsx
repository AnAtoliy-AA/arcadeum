'use client';

import {
  GameMilestoneToast,
  type MilestoneTone,
} from '@/features/games/ui/GameMilestoneToast';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

interface SolitaireMilestoneToastProps {
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
  if (milestone >= 39) {
    return {
      icon: '👑',
      badgeKey: 'games.solitaire_v1.milestone.badge_39' as TranslationKey,
      titleKey: 'games.solitaire_v1.milestone.title_39' as TranslationKey,
      bodyKey: 'games.solitaire_v1.milestone.body_39' as TranslationKey,
      tone: 'yellow',
      sparkles: ['✨', '👑', '🎉'],
    };
  }

  return {
    icon: '🃏',
    badgeKey: 'games.solitaire_v1.milestone.badge_26' as TranslationKey,
    titleKey: 'games.solitaire_v1.milestone.title_26' as TranslationKey,
    bodyKey: 'games.solitaire_v1.milestone.body_26' as TranslationKey,
    tone: 'amber',
    sparkles: ['✨', '🃏'],
  };
}

export function SolitaireMilestoneToast({
  milestone,
  onDismiss,
}: SolitaireMilestoneToastProps) {
  const { t } = useTranslation();

  if (milestone === null) return null;

  const tier = getTierConfig(milestone);
  const title = t(tier.titleKey) || t('games.solitaire_v1.milestone.title');
  const badge = t(tier.badgeKey) || t('games.solitaire_v1.milestone.badge');
  const description =
    t(tier.bodyKey) || t('games.solitaire_v1.milestone.body_26');

  return (
    <GameMilestoneToast
      isOpen
      icon={tier.icon}
      badge={badge}
      title={title}
      description={description}
      actionLabel={t('games.solitaire_v1.milestone.keepGoing')}
      onDismiss={onDismiss}
      tone={tier.tone}
      sparkles={tier.sparkles}
      dataTestId="solitaire-milestone-toast"
      actionTestId="solitaire-milestone-dismiss"
    />
  );
}
