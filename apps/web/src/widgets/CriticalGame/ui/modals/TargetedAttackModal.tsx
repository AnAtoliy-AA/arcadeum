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
import type { CriticalCard } from '../../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface TargetedAttackModalProps {
  isOpen: boolean;
  onClose: () => void;
  aliveOpponents: Array<{
    playerId: string;
    hand: CriticalCard[];
  }>;
  selectedTarget: string | null;
  onSelectTarget: (target: string) => void;
  onConfirm: () => void;
  resolveDisplayName: (playerId?: string, fallback?: string) => string;
  t: (key: TranslationKey, params?: Record<string, unknown>) => string;
  titleKey?: TranslationKey;
  selectPlayerKey?: TranslationKey;
  descriptionKey?: TranslationKey;
  emoji?: string;
  cardVariant?: string;
}

export const TargetedAttackModal: React.FC<TargetedAttackModalProps> = ({
  isOpen,
  onClose,
  aliveOpponents,
  selectedTarget,
  onSelectTarget,
  onConfirm,
  resolveDisplayName,
  t,
  titleKey = 'games.table.modals.targetedAttack.title',
  selectPlayerKey = 'games.table.modals.targetedAttack.selectPlayer',
  descriptionKey = 'games.table.modals.targetedAttack.description',
  emoji = '🎯',
  cardVariant,
}) => {
  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} $variant={cardVariant}>
        <ModalHeader $variant={cardVariant}>
          <ModalTitle $variant={cardVariant}>
            {emoji} {t(titleKey)}
          </ModalTitle>
          <CloseButton onClick={onClose} $variant={cardVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel>{t(selectPlayerKey)}</SectionLabel>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>
            {t(descriptionKey)}
          </p>
          <OptionGrid>
            {aliveOpponents.map((opponent) => (
              <OptionButton
                key={opponent.playerId}
                $selected={selectedTarget === opponent.playerId}
                onClick={() => onSelectTarget(opponent.playerId)}
                disabled={
                  opponent.hand.length === 0 &&
                  false /* Opponents don't need cards to be attacked */
                }
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
            {t('games.table.modals.common.confirm') || 'Confirm'}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
