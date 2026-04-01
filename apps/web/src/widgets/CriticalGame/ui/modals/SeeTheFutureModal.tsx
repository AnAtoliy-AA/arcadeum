import React from 'react';
import { YStack, Text } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  OptionGrid,
  OptionButton,
  ModalActions,
  ModalButton,
} from '../styles';
import { type GameVariant } from '@arcadeum/ui';
import { getCardEmoji, getCardTranslationKey } from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';

interface SeeTheFutureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CriticalCard[];
  t: (key: string) => string;
  cardVariant?: string;
}

export const SeeTheFutureModal: React.FC<SeeTheFutureModalProps> = ({
  isOpen,
  onClose,
  cards,
  t,
  cardVariant,
}) => {
  if (!isOpen) return null;

  return (
    <Modal open={isOpen}>
      <ModalContent
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            🔮 {t('games.table.modals.seeTheFuture.title')}
          </ModalTitle>
          <CloseButton onPress={onClose} $variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <OptionGrid>
          {cards.map((card, index) => (
            <OptionButton
              key={`${card}-${index}`}
              $selected={false}
              $variant={cardVariant as GameVariant}
            >
              <YStack alignItems="center">
                <Text fontSize="$2" opacity={0.7}>
                  #{index + 1}
                </Text>
                <Text fontSize="$8">{getCardEmoji(card)}</Text>
                <Text fontSize="$2" textAlign="center">
                  {t(getCardTranslationKey(card, cardVariant)) || card}
                </Text>
              </YStack>
            </OptionButton>
          ))}
        </OptionGrid>
        <ModalActions>
          <ModalButton onPress={onClose}>
            {t('games.table.modals.seeTheFuture.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
