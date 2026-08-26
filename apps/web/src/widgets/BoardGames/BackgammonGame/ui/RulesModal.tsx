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
      title: t('games.backgammon_v1.rules.objectiveTitle'),
      body: t('games.backgammon_v1.rules.objective'),
    },
    {
      badge: '🎲',
      title: t('games.backgammon_v1.rules.movementTitle'),
      body: t('games.backgammon_v1.rules.movement'),
    },
    {
      badge: '⚡',
      title: t('games.backgammon_v1.rules.hittingTitle'),
      body: t('games.backgammon_v1.rules.hitting'),
    },
    {
      badge: '🏆',
      title: t('games.backgammon_v1.rules.bearingOffTitle'),
      body: t('games.backgammon_v1.rules.bearingOff'),
    },
  ];

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.backgammon_v1.rules.title')}
      icon="🎲"
      rules={rules}
    />
  );
}
