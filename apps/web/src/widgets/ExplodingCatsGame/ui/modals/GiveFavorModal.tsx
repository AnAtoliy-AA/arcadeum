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
} from '../styles';
import { getCardEmoji, getCardTranslationKey } from '../../lib/cardUtils';
import type { ExplodingCatsCard } from '../../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface GiveFavorModalProps {
  isOpen: boolean;
  requesterName: string;
  myHand: ExplodingCatsCard[];
  onGiveCard: (card: ExplodingCatsCard) => void;
  t: (key: TranslationKey) => string;
}

export const GiveFavorModal: React.FC<GiveFavorModalProps> = ({
  isOpen,
  requesterName,
  myHand,
  onGiveCard,
  t,
}) => {
  const [selectedCard, setSelectedCard] = useState<ExplodingCatsCard | null>(
    null,
  );

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
                onClick={() => setSelectedCard(card)}
              >
                <div style={{ fontSize: '1.5rem' }}>{getCardEmoji(card)}</div>
                <div style={{ fontSize: '0.75rem' }}>
                  {t(getCardTranslationKey(card)) || card}
                </div>
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
