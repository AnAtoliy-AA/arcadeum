import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalSection,
  SectionLabel,
  CardsGrid,
  Card,
  CardCorner,
  CardFrame,
  CardInner,
  CardEmoji,
  CardName,
  ModalActions,
  ModalButton,
} from '../styles';
import { type GameVariant } from '@arcadeum/ui';
import { getCardEmoji, getCardTranslationKey } from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';

interface StashModalProps {
  isOpen: boolean;
  onClose: () => void;
  hand: CriticalCard[];
  onConfirm: (selectedCards: CriticalCard[]) => void;
  t: (key: string) => string;
  cardVariant?: string;
}

export const StashModal: React.FC<StashModalProps> = ({
  isOpen,
  onClose,
  hand,
  onConfirm,
  t,
  cardVariant,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleCard = (index: number) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  };

  const handleConfirm = () => {
    const selectedCards = selectedIndices.map((i) => hand[i]);
    onConfirm(selectedCards);
    setSelectedIndices([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedIndices([]);
    onClose();
  };

  return (
    <Modal open={isOpen}>
      <ModalContent
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            🏰 {t('games.table.modals.stash.title')}
          </ModalTitle>
          <CloseButton
            onPress={handleClose}
            $variant={cardVariant as GameVariant}
          >
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel $variant={cardVariant as GameVariant}>
            {t('games.table.modals.stash.description')}
          </SectionLabel>
          <CardsGrid maxHeight={400} overflowY="auto" padding="$2">
            {hand.map((card, index) => {
              const isSelected = selectedIndices.includes(index);
              return (
                <Card
                  key={`${card}-${index}`}
                  $cardType={card}
                  $index={0}
                  $variant={cardVariant as GameVariant}
                  onPress={() => toggleCard(index)}
                  scale={isSelected ? 1.05 : 1}
                  shadowColor={
                    isSelected ? 'rgba(255, 255, 255, 0.5)' : undefined
                  }
                  shadowRadius={isSelected ? 15 : undefined}
                  borderWidth={isSelected ? 2 : 0}
                  borderColor={isSelected ? 'white' : 'transparent'}
                  cursor="pointer"
                >
                  <CardCorner $position="tl" />
                  <CardCorner $position="tr" />
                  <CardCorner $position="bl" />
                  <CardCorner $position="br" />
                  <CardFrame />
                  <CardInner>
                    <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                    <CardName>
                      {t(getCardTranslationKey(card, cardVariant))}
                    </CardName>
                  </CardInner>
                </Card>
              );
            })}
          </CardsGrid>
        </ModalSection>
        <ModalActions>
          <ModalButton variant="secondary" onPress={handleClose}>
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton
            onPress={handleConfirm}
            disabled={selectedIndices.length === 0}
          >
            {t('games.table.modals.stash.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
