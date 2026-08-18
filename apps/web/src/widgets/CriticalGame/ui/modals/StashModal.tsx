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
  CardName,
  ModalActions,
  ModalButton,
  GradientScrim,
} from '../styles';
import { CardImage } from '../styles/card-image';
import { type GameVariant } from '@arcadeum/ui';
import { getCardTranslationKey } from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';

interface StashModalProps {
  isOpen: boolean;
  onClose: () => void;
  hand: CriticalCard[];
  onConfirm: (selectedCards: CriticalCard[]) => void;
  t: (key: string) => string;
  cardVariant?: string;
}

const StashModal: React.FC<StashModalProps> = ({
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
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        variant={cardVariant as GameVariant}
      >
        <ModalHeader variant={cardVariant as GameVariant}>
          <ModalTitle variant={cardVariant as GameVariant}>
            🏰 {t('games.table.modals.stash.title')}
          </ModalTitle>
          <CloseButton
            onClick={handleClose}
            variant={cardVariant as GameVariant}
          >
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel variant={cardVariant as GameVariant}>
            {t('games.table.modals.stash.description')}
          </SectionLabel>
          <CardsGrid className="max-h-[400px] overflow-y-auto p-2">
            {hand.map((card, index) => {
              const isSelected = selectedIndices.includes(index);
              return (
                <Card
                  key={`${card}-${index}`}
                  cardType={card}
                  index={0}
                  variant={cardVariant as GameVariant}
                  onClick={() => toggleCard(index)}
                  className={
                    isSelected
                      ? 'scale-[1.05] shadow-[0_7.5px_15px_rgba(255,255,255,0.5)]'
                      : undefined
                  }
                  style={{ borderColor: isSelected ? 'white' : 'transparent' }}
                >
                  <CardCorner position="tl" />
                  <CardCorner position="tr" />
                  <CardCorner position="bl" />
                  <CardCorner position="br" />
                  <CardFrame />
                  <CardInner>
                    <CardImage variant={cardVariant ?? ''} cardType={card} />
                    <GradientScrim />
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

export default StashModal;
