import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalSection,
  SectionLabel,
  OptionGrid,
  OptionButton,
  ModalActions,
  ModalButton,
} from './styles';
import { type GameVariant } from '@arcadeum/ui';
import { getCardEmoji, getCardTranslationKey } from '../lib/cardUtils';
import type { OmniscienceModalState } from '../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface OmniscienceModalProps {
  omniscienceModal: OmniscienceModalState | null;
  onClose: () => void;
  resolveDisplayName: (
    playerId?: string,
    fallbackName?: string,
  ) => string | undefined;
  t: (key: TranslationKey) => string;
  cardVariant?: string;
}

export function OmniscienceModal({
  omniscienceModal,
  onClose,
  resolveDisplayName,
  t,
  cardVariant,
}: OmniscienceModalProps) {
  if (!omniscienceModal) return null;

  return (
    <Modal>
      <ModalContent
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            👁️ {t('games.table.cards.omniscience') || 'Omniscience'}
          </ModalTitle>
          <CloseButton onPress={onClose} $variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>

        {omniscienceModal.hands.map((hand) => (
          <ModalSection key={hand.playerId}>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {resolveDisplayName(hand.playerId, 'Player')}
            </SectionLabel>
            {hand.cards.length === 0 ? (
              <p style={{ opacity: 0.7, textAlign: 'center' }}>
                {t('games.table.modals.omniscience.emptyHand') ||
                  'No cards in hand.'}
              </p>
            ) : (
              <OptionGrid>
                {hand.cards.map((card, idx) => (
                  <OptionButton
                    key={`${hand.playerId}-${idx}`}
                    $selected={false}
                    $variant={cardVariant as GameVariant}
                  >
                    <div style={{ fontSize: '2rem' }}>{getCardEmoji(card)}</div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {t(getCardTranslationKey(card, cardVariant)) || card}
                    </div>
                  </OptionButton>
                ))}
              </OptionGrid>
            )}
          </ModalSection>
        ))}

        <ModalActions>
          <ModalButton onPress={onClose}>
            {t('games.table.modals.common.close') || 'Close'}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
}
