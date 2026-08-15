import type { GameVariant } from '@arcadeum/ui';
import React, { useState } from 'react';
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
                className="p-0 h-auto"
              >
                <div className="box-border flex flex-col items-center w-[100px] gap-2 p-2">
                  <Card
                    $cardType={card}
                    $variant={cardVariant as GameVariant}
                    className="w-full cursor-default"
                  >
                    <CardCorner $position="tl" $variant={cardVariant} />
                    <CardCorner $position="tr" $variant={cardVariant} />
                    <CardCorner $position="bl" $variant={cardVariant} />
                    <CardCorner $position="br" $variant={cardVariant} />
                    <CardFrame $variant={cardVariant} />
                    <CardImage variant={cardVariant ?? ''} cardType={card} />
                    <GradientScrim />
                  </Card>
                  <span className="box-border text-[14px] text-center w-full line-clamp-1">
                    {getCardName(card, cardVariant || 'adventure')}
                  </span>
                  <span className="box-border text-[12px] opacity-[0.7] line-clamp-2">
                    {t(getCardDescriptionKey(card))}
                  </span>
                </div>
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
