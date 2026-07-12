'use client';

import { memo } from 'react';
import { YStack, Text, Button, XStack } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PIECE_SYMBOLS } from '../types';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

function RulesModalImpl({ open, onClose }: RulesModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

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
        maxWidth={480}
        width="90%"
        maxHeight="80vh"
        style={{ overflow: 'auto' }}
      >
        <Text fontSize="$6" fontWeight="700">
          {t('games.chess_v1.rules.title')}
        </Text>
        <YStack gap="$3" width="100%">
          <Text fontSize="$4" fontWeight="600">
            {t('games.chess_v1.rules.objective')}
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            {t('games.chess_v1.rules.objectiveText')}
          </Text>
          <Text fontSize="$4" fontWeight="600" mt="$2">
            {t('games.chess_v1.rules.pieces')}
          </Text>
          <XStack flexWrap="wrap" gap="$2">
            {(
              ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'] as const
            ).map((type) => (
              <XStack
                key={type}
                gap="$1"
                alignItems="center"
                padding="$1"
                paddingHorizontal="$2"
                borderRadius={8}
                backgroundColor="rgba(255,255,255,0.05)"
              >
                <Text fontSize={20}>{PIECE_SYMBOLS[type].white}</Text>
                <Text fontSize="$2" textTransform="capitalize">
                  {type}
                </Text>
              </XStack>
            ))}
          </XStack>
          <Text fontSize="$4" fontWeight="600" mt="$2">
            {t('games.chess_v1.rules.special')}
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • <Text fontWeight="600">Castling:</Text>{' '}
            {t('games.chess_v1.rules.castling')}
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • <Text fontWeight="600">En passant:</Text>{' '}
            {t('games.chess_v1.rules.enPassant')}
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • <Text fontWeight="600">Promotion:</Text>{' '}
            {t('games.chess_v1.rules.promotion')}
          </Text>
          <Text fontSize="$4" fontWeight="600" mt="$2">
            {t('games.chess_v1.rules.drawConditions')}
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • {t('games.chess_v1.rules.drawStalemate')}
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • {t('games.chess_v1.rules.drawFiftyMove')}
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • {t('games.chess_v1.rules.drawRepetition')}
          </Text>
          <Text fontSize="$3" opacity={0.8}>
            • {t('games.chess_v1.rules.drawMaterial')}
          </Text>
        </YStack>
        <Button size="$3" onPress={onClose} mt="$2">
          {t('games.chess_v1.rules.gotIt')}
        </Button>
      </YStack>
    </div>
  );
}

export const RulesModal = memo(RulesModalImpl);
