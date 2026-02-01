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
    <Modal onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} $variant={cardVariant}>
        <ModalHeader $variant={cardVariant}>
          <ModalTitle $variant={cardVariant}>
            🏰 {t('games.table.modals.stash.title')}
          </ModalTitle>
          <CloseButton onClick={handleClose} $variant={cardVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel $variant={cardVariant}>
            {t('games.table.modals.stash.description')}
          </SectionLabel>
          <CardsGrid
            style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}
          >
            {hand.map((card, index) => (
              <Card
                key={`${card}-${index}`}
                $cardType={card}
                $index={0}
                $variant={cardVariant}
                onClick={() => toggleCard(index)}
                style={{
                  cursor: 'pointer',
                  transform: selectedIndices.includes(index)
                    ? 'scale(1.05)'
                    : 'scale(1)',
                  boxShadow: selectedIndices.includes(index)
                    ? '0 0 15px rgba(255, 255, 255, 0.5)'
                    : 'none',
                  border: selectedIndices.includes(index)
                    ? '2px solid white'
                    : 'none',
                }}
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
            ))}
          </CardsGrid>
        </ModalSection>
        <ModalActions>
          <ModalButton variant="secondary" onClick={handleClose}>
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton
            onClick={handleConfirm}
            disabled={selectedIndices.length === 0}
          >
            {t('games.table.modals.stash.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
