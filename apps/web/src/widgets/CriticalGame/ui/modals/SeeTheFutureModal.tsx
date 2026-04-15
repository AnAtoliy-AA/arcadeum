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
  Card,
  CardFrame,
  CardCorner,
  GradientScrim,
} from '../styles';
import { CardImage } from '../styles/card-image';
import { type GameVariant } from '@arcadeum/ui';
import { getCardTranslationKey } from '../../lib/cardUtils';
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
              padding={0}
              height="auto"
            >
              <YStack alignItems="center" width={100} gap="$2" padding="$2">
                <Text fontSize="$2" opacity={0.7}>
                  #{index + 1}
                </Text>
                <Card
                  $cardType={card}
                  $variant={cardVariant as GameVariant}
                  width="100%"
                  cursor="default"
                >
                  <CardCorner $position="tl" $variant={cardVariant} />
                  <CardCorner $position="tr" $variant={cardVariant} />
                  <CardCorner $position="bl" $variant={cardVariant} />
                  <CardCorner $position="br" $variant={cardVariant} />
                  <CardFrame $variant={cardVariant} />
                  <CardImage variant={cardVariant ?? ''} cardType={card} />
                  <GradientScrim />
                </Card>
                <Text fontSize="$2" textAlign="center" numberOfLines={1}>
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
