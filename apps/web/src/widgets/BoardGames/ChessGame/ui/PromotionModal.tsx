'use client';

import { memo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  PIECE_SYMBOLS,
  PROMOTION_PIECES,
  type PieceType,
  type PieceColor,
} from '../types';
import {
  ModalOverlay,
  ModalContent,
  ModalTitle,
  PromotionGrid,
  PromotionOption,
  CancelButton,
} from './styles';

interface PromotionModalProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (piece: PieceType) => void;
  onCancel: () => void;
}

function PromotionModalImpl({
  isOpen,
  color,
  onSelect,
  onCancel,
}: PromotionModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent style={{ minWidth: 280 }}>
        <ModalTitle>{t('games.chess_v1.status.promotionTitle')}</ModalTitle>
        <PromotionGrid>
          {PROMOTION_PIECES.map((pieceType) => (
            <PromotionOption
              key={pieceType}
              onClick={() => onSelect(pieceType)}
            >
              <span
                className={`text-[40px] leading-[16px] select-none ${
                  color === 'white'
                    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                    : 'text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
                }`}
              >
                {PIECE_SYMBOLS[pieceType][color]}
              </span>
            </PromotionOption>
          ))}
        </PromotionGrid>
        <CancelButton onClick={onCancel}>
          {t('games.chess_v1.actions.declineDraw')}
        </CancelButton>
      </ModalContent>
    </ModalOverlay>
  );
}

export const PromotionModal = memo(PromotionModalImpl);
