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
      title: t('games.go_v1.rules.objectiveTitle'),
      body: t('games.go_v1.rules.objective'),
    },
    {
      title: t('games.go_v1.rules.captureTitle'),
      body: t('games.go_v1.rules.capture'),
    },
    {
      title: t('games.go_v1.rules.koTitle'),
      body: t('games.go_v1.rules.ko'),
    },
    {
      title: t('games.go_v1.rules.passTitle'),
      body: t('games.go_v1.rules.pass'),
    },
    {
      title: t('games.go_v1.rules.scoringTitle'),
      body: t('games.go_v1.rules.scoring'),
    },
  ];

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.go_v1.rules.title')}
      icon="⚪"
      rules={rules}
    />
  );
}
