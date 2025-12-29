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
} from '../styles';
import type { ExplodingCatsCard } from '../../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface FavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  aliveOpponents: Array<{
    playerId: string;
    hand: ExplodingCatsCard[];
  }>;
  selectedTarget: string | null;
  onSelectTarget: (target: string) => void;
  onConfirm: () => void;
  resolveDisplayName: (playerId?: string, fallback?: string) => string;
  t: (key: TranslationKey) => string;
}

export const FavorModal: React.FC<FavorModalProps> = ({
  isOpen,
  onClose,
  aliveOpponents,
  selectedTarget,
  onSelectTarget,
  onConfirm,
  resolveDisplayName,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>🤝 {t('games.table.modals.favor.title')}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel>
            {t('games.table.modals.favor.selectPlayer')}
          </SectionLabel>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>
            {t('games.table.modals.favor.description')}
          </p>
          <OptionGrid>
            {aliveOpponents.map((opponent) => (
              <OptionButton
                key={opponent.playerId}
                $selected={selectedTarget === opponent.playerId}
                onClick={() => onSelectTarget(opponent.playerId)}
                disabled={opponent.hand.length === 0}
              >
                <div style={{ fontSize: '1.5rem' }}>🎮</div>
                <div>
                  {resolveDisplayName(
                    opponent.playerId,
                    `Player ${opponent.playerId.slice(0, 8)}`,
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  {t('games.table.modals.favor.cardsCount').replace(
                    '{count}',
                    opponent.hand.length.toString(),
                  )}
                </div>
              </OptionButton>
            ))}
          </OptionGrid>
        </ModalSection>
        <ModalActions>
          <ModalButton variant="secondary" onClick={onClose}>
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton onClick={onConfirm} disabled={!selectedTarget}>
            {t('games.table.modals.favor.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
