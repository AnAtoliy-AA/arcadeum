'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { GameRulesModal } from '@/features/games/ui/GameRulesModal';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  const { t } = useTranslation();

  const rules = [
    {
      badge: '🎯',
      title: t('games.checkers_v1.rules.headers.objective'),
      body: t('games.checkers_v1.rules.objective'),
    },
    {
      badge: '🎮',
      title: t('games.checkers_v1.rules.headers.howToPlay'),
      body: t('games.checkers_v1.rules.steps'),
    },
    {
      badge: '👑',
      title: t('games.checkers_v1.rules.headers.kingPromotion'),
      body: t('games.checkers_v1.rules.kingPromotion'),
    },
    {
      badge: '🔄',
      title: t('games.checkers_v1.rules.headers.backwardCaptures'),
      body: t('games.checkers_v1.rules.backwardCaptures'),
    },
    {
      badge: '⚡',
      title: t('games.checkers_v1.rules.headers.forcedCaptures'),
      body: t('games.checkers_v1.rules.forcedCaptures'),
    },
    {
      badge: '🏆',
      title: t('games.checkers_v1.rules.headers.winConditions'),
      body: t('games.checkers_v1.rules.winConditions'),
    },
  ];

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.checkers_v1.rules.title')}
      icon="🏁"
      rules={rules}
    />
  );
}
