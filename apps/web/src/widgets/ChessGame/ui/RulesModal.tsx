'use client';

import { memo } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PIECE_SYMBOLS } from '../types';
import { ModalOverlay, ModalContent, ModalTitle, ModalButton } from './styles';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

function RulesModalImpl({ open, onClose }: RulesModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <ModalOverlay>
      <ModalContent maxWidth={480} width="90%" maxHeight="80vh">
        <ModalTitle fontSize={20}>{t('games.chess_v1.rules.title')}</ModalTitle>

        <YStack gap={16} width="100%">
          <YStack gap={2}>
            <Text fontSize={15} fontWeight="600" color="#f8fafc">
              {t('games.chess_v1.rules.objective')}
            </Text>
            <Text
              fontSize={13}
              color="rgba(148, 163, 184, 0.8)"
              lineHeight={1.5}
            >
              {t('games.chess_v1.rules.objectiveText')}
            </Text>
          </YStack>

          <YStack gap={2}>
            <Text
              fontSize={15}
              fontWeight="600"
              color="#f8fafc"
              marginBottom={8}
            >
              {t('games.chess_v1.rules.pieces')}
            </Text>
            <XStack flexWrap="wrap" gap={8}>
              {(
                ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'] as const
              ).map((type) => (
                <XStack
                  key={type}
                  gap={6}
                  alignItems="center"
                  padding={6}
                  paddingHorizontal={10}
                  borderRadius={8}
                  backgroundColor="rgba(255, 255, 255, 0.04)"
                  borderWidth={1}
                  borderColor="rgba(255, 255, 255, 0.06)"
                >
                  <Text fontSize={18}>{PIECE_SYMBOLS[type].white}</Text>
                  <Text
                    fontSize={12}
                    textTransform="capitalize"
                    color="rgba(148, 163, 184, 0.8)"
                  >
                    {type}
                  </Text>
                </XStack>
              ))}
            </XStack>
          </YStack>

          <YStack gap={2}>
            <Text fontSize={15} fontWeight="600" color="#f8fafc">
              {t('games.chess_v1.rules.special')}
            </Text>
            <YStack gap={1}>
              <Text
                fontSize={13}
                lineHeight={20}
                color="rgba(148, 163, 184, 0.8)"
              >
                •{' '}
                <Text fontWeight="600" color="#e2e8f0">
                  Castling:
                </Text>{' '}
                {t('games.chess_v1.rules.castling')}
              </Text>
              <Text
                fontSize={13}
                lineHeight={20}
                color="rgba(148, 163, 184, 0.8)"
              >
                •{' '}
                <Text fontWeight="600" color="#e2e8f0">
                  En passant:
                </Text>{' '}
                {t('games.chess_v1.rules.enPassant')}
              </Text>
              <Text
                fontSize={13}
                lineHeight={20}
                color="rgba(148, 163, 184, 0.8)"
              >
                •{' '}
                <Text fontWeight="600" color="#e2e8f0">
                  Promotion:
                </Text>{' '}
                {t('games.chess_v1.rules.promotion')}
              </Text>
            </YStack>
          </YStack>

          <YStack gap={2}>
            <Text fontSize={15} fontWeight="600" color="#f8fafc">
              {t('games.chess_v1.rules.drawConditions')}
            </Text>
            <YStack gap={1}>
              <Text
                fontSize={13}
                lineHeight={20}
                color="rgba(148, 163, 184, 0.8)"
              >
                • {t('games.chess_v1.rules.drawStalemate')}
              </Text>
              <Text
                fontSize={13}
                lineHeight={20}
                color="rgba(148, 163, 184, 0.8)"
              >
                • {t('games.chess_v1.rules.drawFiftyMove')}
              </Text>
              <Text
                fontSize={13}
                lineHeight={20}
                color="rgba(148, 163, 184, 0.8)"
              >
                • {t('games.chess_v1.rules.drawRepetition')}
              </Text>
              <Text
                fontSize={13}
                lineHeight={20}
                color="rgba(148, 163, 184, 0.8)"
              >
                • {t('games.chess_v1.rules.drawMaterial')}
              </Text>
            </YStack>
          </YStack>
        </YStack>

        <ModalButton onPress={onClose} marginTop={4}>
          {t('games.chess_v1.rules.gotIt')}
        </ModalButton>
      </ModalContent>
    </ModalOverlay>
  );
}

export const RulesModal = memo(RulesModalImpl);
