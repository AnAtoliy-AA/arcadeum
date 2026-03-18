import type { GameVariant } from '@arcadeum/ui';
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
  ScrollableCardsGrid,
  SelectableCard,
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
  t: (key: string, params?: Record<string, string | number>) => string;
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

  const gameVariant = cardVariant as GameVariant;

  return (
    <Modal open={isOpen}>
      <ModalContent
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={gameVariant}
      >
        <ModalHeader $variant={gameVariant}>
          <ModalTitle $variant={gameVariant}>
            🤲 {t('games.table.modals.giveFavor.title')}
          </ModalTitle>
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
                onPress={() => setSelectedCard(card)}
                selected={selectedCard === card}
              >
                <CardCorner $position="tl" />
                <CardCorner $position="tr" />
                <CardCorner $position="bl" />
                <CardCorner $position="br" />
                <CardFrame />
                <CardInner>
                  <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                  <CardName $variant={cardVariant as GameVariant}>
                    {t(getCardTranslationKey(card, cardVariant)) || card}
                  </CardName>
                  <CardDescription $variant={cardVariant as GameVariant}>
                    {t(getCardDescriptionKey(card))}
                  </CardDescription>
                </CardInner>
              </SelectableCard>
            ))}
          </ScrollableCardsGrid>
        </ModalSection>
        <ModalActions>
          <ModalButton onPress={handleConfirm} disabled={!selectedCard}>
            {t('games.table.modals.giveFavor.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
