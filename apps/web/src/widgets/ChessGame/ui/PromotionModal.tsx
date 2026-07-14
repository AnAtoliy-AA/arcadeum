'use client';

import { memo } from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  PIECE_SYMBOLS,
  PROMOTION_PIECES,
  type PieceType,
  type PieceColor,
} from '../types';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <YStack
        gap="$4"
        padding="$5"
        borderRadius={16}
        backgroundColor="$background"
        alignItems="center"
        minWidth={280}
      >
        <Text fontSize="$5" fontWeight="700">
          {t('games.chess_v1.status.promotionTitle')}
        </Text>
        <XStack gap="$3" justifyContent="center">
          {PROMOTION_PIECES.map((pieceType) => (
            <Button
              key={pieceType}
              size="$5"
              onPress={() => onSelect(pieceType)}
              style={{
                fontSize: 40,
                lineHeight: 1,
              }}
            >
              {PIECE_SYMBOLS[pieceType][color]}
            </Button>
          ))}
        </XStack>
        <Button size="$3" variant="outlined" onPress={onCancel}>
          {t('games.chess_v1.actions.declineDraw')}
        </Button>
      </YStack>
    </div>
  );
}

export const PromotionModal = memo(PromotionModalImpl);
