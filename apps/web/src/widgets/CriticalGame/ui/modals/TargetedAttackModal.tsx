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
import { type GameVariant } from '@arcadeum/ui';
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

const TargetedAttackModal: React.FC<TargetedAttackModalProps> = ({
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
    <Modal open={isOpen}>
      <ModalContent
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        variant={cardVariant as GameVariant}
      >
        <ModalHeader variant={cardVariant as GameVariant}>
          <ModalTitle variant={cardVariant as GameVariant}>
            {emoji} {t(titleKey)}
          </ModalTitle>
          <CloseButton onClick={onClose} variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel variant={cardVariant as GameVariant}>
            {t(selectPlayerKey)}
          </SectionLabel>
          <span className="text-[16px] opacity-[0.8] -mb-4">
            {t(descriptionKey)}
          </span>
          <OptionGrid>
            {aliveOpponents.map((opponent) => (
              <OptionButton
                key={opponent.playerId}
                active={selectedTarget === opponent.playerId}
                gameVariant={cardVariant as GameVariant}
                onClick={() => onSelectTarget(opponent.playerId)}
                disabled={
                  opponent.hand.length === 0 &&
                  false /* Opponents don't need cards to be attacked */
                }
              >
                <span className="text-[24px]">🎮</span>
                <div className="flex flex-col items-stretch">
                  <span className="">
                    {resolveDisplayName(
                      opponent.playerId,
                      `Player ${opponent.playerId.slice(0, 8)}`,
                    )}
                  </span>
                  <span className="text-[14px] opacity-[0.7]">
                    {t('games.table.modals.favor.cardsCount', {
                      count: opponent.hand.length,
                    })}
                  </span>
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

export default TargetedAttackModal;
