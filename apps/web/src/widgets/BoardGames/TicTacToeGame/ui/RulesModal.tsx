'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { GameRulesModal } from '@/features/games/ui/GameRulesModal';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  boardSize: number | string;
  winLength: number;
  expansionMargin?: number;
}

export function RulesModal({
  open,
  onClose,
  boardSize,
  winLength,
  expansionMargin = 3,
}: RulesModalProps) {
  const { t } = useTranslation();
  const isInfinity = boardSize === 'infinity';

  const rules = [
    {
      badge: '🎯',
      title: t('games.tic_tac_toe_v1.rules.headers.objective'),
      body: isInfinity
        ? t('games.tic_tac_toe_v1.rules.objectiveInfinity', {
            winLength: String(winLength),
            margin: String(expansionMargin),
          })
        : t('games.tic_tac_toe_v1.rules.objective', {
            winLength: String(winLength),
          }),
    },
    {
      badge: '🎮',
      title: t('games.tic_tac_toe_v1.rules.headers.howToPlay'),
      body: t('games.tic_tac_toe_v1.rules.steps'),
    },
    {
      badge: '📏',
      title: t('games.tic_tac_toe_v1.rules.headers.boardSizes'),
      body: t('games.tic_tac_toe_v1.rules.winLengths'),
    },
  ];

  if (isInfinity) {
    rules.splice(2, 0, {
      badge: '✨',
      title: t('games.tic_tac_toe_v1.rules.headers.infinityMode'),
      body: t('games.tic_tac_toe_v1.rules.infinityDescription', {
        margin: String(expansionMargin),
      }),
    });
  }

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.tic_tac_toe_v1.rules.title')}
      icon="❌"
      rules={rules}
    />
  );
}
