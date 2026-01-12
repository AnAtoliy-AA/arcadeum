import React from 'react';
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
} from '../styles';
import { getCardEmoji, getCardTranslationKey } from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface SeeTheFutureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CriticalCard[];
  t: (key: TranslationKey) => string;
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
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            🔮 {t('games.table.modals.seeTheFuture.title')}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <OptionGrid>
          {cards.map((card, index) => (
            <OptionButton key={`${card}-${index}`} $selected={false}>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                #{index + 1}
              </div>
              <div style={{ fontSize: '2rem' }}>{getCardEmoji(card)}</div>
              <div style={{ fontSize: '0.75rem' }}>
                {t(getCardTranslationKey(card, cardVariant)) || card}
              </div>
            </OptionButton>
          ))}
        </OptionGrid>
        <ModalActions>
          <ModalButton onClick={onClose}>
            {t('games.table.modals.seeTheFuture.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
