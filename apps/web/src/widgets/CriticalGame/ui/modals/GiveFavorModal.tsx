import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalSection,
  SectionLabel,
  CardCorner,
  CardFrame,
  CardInner,
  CardEmoji,
  CardName,
  CardDescription,
  ModalActions,
  ModalButton,
  ScrollableCardsGrid, // New component
  SelectableCard, // New component
} from '../styles';
import {
  getCardEmoji,
  getCardTranslationKey,
  getCardDescriptionKey,
} from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';

interface GiveFavorModalProps {
  isOpen: boolean;
  requesterName: string;
  myHand: CriticalCard[];
  onGiveCard: (card: CriticalCard) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, params?: Record<string, any>) => string;
  cardVariant?: string;
}

export const GiveFavorModal: React.FC<GiveFavorModalProps> = ({
  isOpen,
  requesterName,
  myHand,
  onGiveCard,
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

  return (
    <Modal>
      <ModalContent onClick={(e) => e.stopPropagation()} $variant={cardVariant}>
        <ModalHeader $variant={cardVariant}>
          <ModalTitle $variant={cardVariant}>
            🤲 {t('games.table.modals.giveFavor.title')}
          </ModalTitle>
        </ModalHeader>
        <ModalSection>
          <SectionLabel $variant={cardVariant}>
            {t('games.table.modals.giveFavor.description', {
              player: requesterName,
            })}
          </SectionLabel>
          <ScrollableCardsGrid>
            {myHand.map((card, index) => (
              <SelectableCard
                key={`${card}-${index}`}
                $cardType={card}
                $index={0}
                $variant={cardVariant}
                onClick={() => setSelectedCard(card)}
                $selected={selectedCard === card}
              >
                <CardCorner $position="tl" />
                <CardCorner $position="tr" />
                <CardCorner $position="bl" />
                <CardCorner $position="br" />
                <CardFrame />
                <CardInner>
                  {/* Emoji hidden by default in styles, but good to have for accessibility/fallback if styles change */}
                  <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                  <CardName $variant={cardVariant}>
                    {t(getCardTranslationKey(card, cardVariant)) || card}
                  </CardName>
                  <CardDescription $variant={cardVariant}>
                    {t(getCardDescriptionKey(card))}
                  </CardDescription>
                </CardInner>
              </SelectableCard>
            ))}
          </ScrollableCardsGrid>
        </ModalSection>
        <ModalActions>
          <ModalButton onClick={handleConfirm} disabled={!selectedCard}>
            {t('games.table.modals.giveFavor.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
