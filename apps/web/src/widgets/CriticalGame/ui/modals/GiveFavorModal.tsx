import type { GameVariant } from '@arcadeum/ui';
import React, { useState } from 'react';
import { YStack, Text } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalSection,
  SectionLabel,
  CardCorner,
  CardFrame,
  ModalActions,
  ModalButton,
  ScrollableCardsGrid,
  SelectableCard,
  Card,
  GradientScrim,
} from '../styles';
import { CardImage } from '../styles/card-image';
import { getCardName, getCardDescriptionKey } from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';

interface GiveFavorModalProps {
  isOpen: boolean;
  requesterName: string;
  myHand: CriticalCard[];
  onGiveCard: (card: CriticalCard) => void;
  onCancel?: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  cardVariant?: string;
}

const GiveFavorModal: React.FC<GiveFavorModalProps> = ({
  isOpen,
  requesterName,
  myHand,
  onGiveCard,
  onCancel,
  t,
  cardVariant,
}) => {
  const [selectedCard, setSelectedCard] = useState<CriticalCard | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedCard) {
      onGiveCard(selectedCard);
      setSelectedCard(null);
    }
  };

  const handleCancel = () => {
    setSelectedCard(null);
    onCancel?.();
  };

  const gameVariant = cardVariant as GameVariant;

  return (
    <Modal open={isOpen}>
      <ModalContent
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={gameVariant}
      >
        <ModalHeader $variant={gameVariant}>
          <ModalTitle $variant={gameVariant}>
            🤲 {t('games.table.modals.giveFavor.title')}
          </ModalTitle>
          <CloseButton onClick={handleCancel} $variant={gameVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel $variant={gameVariant}>
            {t('games.table.modals.giveFavor.description', {
              player: requesterName,
            })}
          </SectionLabel>
          <ScrollableCardsGrid>
            {myHand.map((card, index) => (
              <SelectableCard
                key={`${card}-${index}`}
                $cardType={card}
                $index={index}
                $variant={cardVariant as GameVariant}
                onClick={() => setSelectedCard(card)}
                selected={selectedCard === card}
                padding={0}
                height="auto"
              >
                <YStack alignItems="center" width={100} gap="$2" padding="$2">
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
                  <Text
                    fontSize="$2"
                    textAlign="center"
                    width="100%"
                    numberOfLines={1}
                  >
                    {getCardName(card, cardVariant || 'adventure')}
                  </Text>
                  <Text fontSize="$1" opacity={0.7} numberOfLines={2}>
                    {t(getCardDescriptionKey(card))}
                  </Text>
                </YStack>
              </SelectableCard>
            ))}
          </ScrollableCardsGrid>
        </ModalSection>
        <ModalActions>
          <ModalButton variant="secondary" onClick={handleCancel}>
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton onClick={handleConfirm} disabled={!selectedCard}>
            {t('games.table.modals.giveFavor.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export default GiveFavorModal;
