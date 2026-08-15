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
      <ModalContent minWidth={280}>
        <ModalTitle>{t('games.chess_v1.status.promotionTitle')}</ModalTitle>
        <PromotionGrid>
          {PROMOTION_PIECES.map((pieceType) => (
            <PromotionOption
              key={pieceType}
              onPress={() => onSelect(pieceType)}
            >
              <span className="box-border text-[40px] leading-[16px]">
                {PIECE_SYMBOLS[pieceType][color]}
              </span>
            </PromotionOption>
          ))}
        </PromotionGrid>
        <CancelButton onPress={onCancel}>
          {t('games.chess_v1.actions.declineDraw')}
        </CancelButton>
      </ModalContent>
    </ModalOverlay>
  );
}

export const PromotionModal = memo(PromotionModalImpl);
