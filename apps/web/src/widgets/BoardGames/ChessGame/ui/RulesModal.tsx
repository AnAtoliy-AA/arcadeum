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
      title: t('games.chess_v1.rules.objective'),
      body: t('games.chess_v1.rules.objectiveText'),
    },
    {
      badge: '👑',
      title: t('games.chess_v1.rules.pieces'),
      body: '♔ King, ♕ Queen, ♖ Rook, ♗ Bishop, ♘ Knight, ♙ Pawn — each moves with distinct tactical movement patterns.',
    },
    {
      badge: '⚡',
      title: t('games.chess_v1.rules.special'),
      body: `• Castling: ${t('games.chess_v1.rules.castling')} • En passant: ${t('games.chess_v1.rules.enPassant')} • Promotion: ${t('games.chess_v1.rules.promotion')}`,
    },
    {
      badge: '🤝',
      title: t('games.chess_v1.rules.drawConditions'),
      body: `• ${t('games.chess_v1.rules.drawStalemate')} • ${t('games.chess_v1.rules.drawFiftyMove')} • ${t('games.chess_v1.rules.drawRepetition')} • ${t('games.chess_v1.rules.drawMaterial')}`,
    },
  ];

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.chess_v1.rules.title')}
      icon="♟️"
      rules={rules}
    />
  );
}
