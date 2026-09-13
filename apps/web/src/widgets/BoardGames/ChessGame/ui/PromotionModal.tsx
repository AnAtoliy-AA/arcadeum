'use client';

import { memo } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@arcadeum/ui';
import { PROMOTION_PIECES, type PieceType, type PieceColor } from '../types';
import { ChessPieceIcon } from './ChessPieceIcon';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (piece: PieceType) => void;
  onCancel: () => void;
}

const PIECE_NAMES: Record<PieceType, string> = {
  queen: 'Queen',
  rook: 'Rook',
  bishop: 'Bishop',
  knight: 'Knight',
  pawn: 'Pawn',
  king: 'King',
};

function PromotionModalImpl({
  isOpen,
  color,
  onSelect,
  onCancel,
}: PromotionModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('games.chess_v1.status.promotionTitle')}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] p-5 shadow-2xl backdrop-blur-2xl flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-base font-extrabold text-[var(--color)]">
            {t('games.chess_v1.status.promotionTitle')}
          </h2>
          <p className="text-xs text-[var(--textSecondary)] mt-0.5">
            Select a piece to promote your pawn
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {PROMOTION_PIECES.map((pieceType) => (
            <button
              key={pieceType}
              type="button"
              onClick={() => onSelect(pieceType)}
              data-testid={`promote-${pieceType}`}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/80 transition-all duration-150 group cursor-pointer hover:scale-105 active:scale-95"
            >
              <div className="w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform">
                <ChessPieceIcon piece={{ type: pieceType, color }} />
              </div>
              <span className="text-[10px] font-bold text-[var(--textSecondary)] group-hover:text-white capitalize">
                {PIECE_NAMES[pieceType]}
              </span>
            </button>
          ))}
        </div>

        <div className="pt-1">
          <Button variant="outline" size="sm" fullWidth onClick={onCancel}>
            {t('games.chess_v1.actions.declineDraw')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const PromotionModal = memo(PromotionModalImpl);
