import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalSection,
  SectionLabel,
  OptionGrid,
  OptionButton,
  ModalActions,
  ModalButton,
  CardEmoji,
  CardName,
  CardDescription,
} from '../styles';
import { getCardEmoji, getCardTranslationKey } from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';

interface GiveFavorModalProps {
  isOpen: boolean;
  requesterName: string;
  myHand: CriticalCard[];
  onGiveCard: (card: CriticalCard) => void;
  t: (key: string, params?: Record<string, unknown>) => string;
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
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>🤲 {t('games.table.modals.giveFavor.title')}</ModalTitle>
        </ModalHeader>
        <ModalSection>
          <SectionLabel>
            {t('games.table.modals.giveFavor.description').replace(
              '{player}',
              requesterName,
            )}
          </SectionLabel>
          <OptionGrid>
            {myHand.map((card, index) => (
              <OptionButton
                key={`${card}-${index}`}
                $selected={selectedCard === card}
                $variant={cardVariant}
                onClick={() => setSelectedCard(card)}
              >
                <CardEmoji>{getCardEmoji(card)}</CardEmoji>
                <CardName>
                  {t(getCardTranslationKey(card, cardVariant)) || card}
                </CardName>
                <CardDescription></CardDescription>
              </OptionButton>
            ))}
          </OptionGrid>
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
