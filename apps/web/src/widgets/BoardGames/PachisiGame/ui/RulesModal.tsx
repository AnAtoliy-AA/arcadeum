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
      title: t('games.pachisi_v1.rules.objectiveTitle'),
      body: t('games.pachisi_v1.rules.objective'),
    },
    {
      badge: '🎲',
      title: t('games.pachisi_v1.rules.movementTitle'),
      body: t('games.pachisi_v1.rules.movement'),
    },
    {
      badge: '⚔️',
      title: t('games.pachisi_v1.rules.captureTitle'),
      body: t('games.pachisi_v1.rules.capture'),
    },
    {
      badge: '6️⃣',
      title: t('games.pachisi_v1.rules.sixesTitle'),
      body: t('games.pachisi_v1.rules.sixes'),
    },
  ];

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.pachisi_v1.rules.title')}
      icon="🎲"
      rules={rules}
    />
  );
}
