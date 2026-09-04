'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { GameRulesModal } from '@/features/games/ui/GameRulesModal';
import type { BackgammonMode } from '../types';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  mode?: BackgammonMode;
}

const MODE_BADGES: Record<BackgammonMode, string> = {
  standard: '🎲',
  long: '🏃',
  hyper: '⚡',
  tavla: '🇹🇷',
  nackgammon: '🧠',
  gulbara: '🏛️',
};

export function RulesModal({
  open,
  onClose,
  mode = 'standard',
}: RulesModalProps) {
  const { t } = useTranslation();

  const prefix = `games.backgammon_v1.rules.modes.${mode}` as const;

  const rules = [
    {
      badge: MODE_BADGES[mode],
      title: t(`${prefix}.objectiveTitle`),
      body: t(`${prefix}.objective`),
    },
    {
      badge: '🎲',
      title: t(`${prefix}.movementTitle`),
      body: t(`${prefix}.movement`),
    },
    {
      badge: '⚡',
      title: t(`${prefix}.hittingTitle`),
      body: t(`${prefix}.hitting`),
    },
    {
      badge: '🏆',
      title: t(`${prefix}.bearingOffTitle`),
      body: t(`${prefix}.bearingOff`),
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
