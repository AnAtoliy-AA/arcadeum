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

interface FavorModalProps {
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
  t: (key: string) => string;
  cardVariant?: string;
}

const FavorModal: React.FC<FavorModalProps> = ({
  isOpen,
  onClose,
  aliveOpponents,
  selectedTarget,
  onSelectTarget,
  onConfirm,
  resolveDisplayName,
  t,
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
            🤝 {t('games.table.modals.favor.title')}
          </ModalTitle>
          <CloseButton onClick={onClose} variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel variant={cardVariant as GameVariant}>
            {t('games.table.modals.favor.selectPlayer')}
          </SectionLabel>
          <span className="text-[16px] opacity-[0.8] -mb-4">
            {t('games.table.modals.favor.description')}
          </span>
          <OptionGrid>
            {aliveOpponents.map((opponent) => (
              <OptionButton
                key={opponent.playerId}
                active={selectedTarget === opponent.playerId}
                gameVariant={cardVariant as GameVariant}
                onClick={() => onSelectTarget(opponent.playerId)}
                disabled={opponent.hand.length === 0}
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
                    {t('games.table.modals.favor.cardsCount').replace(
                      '{count}',
                      opponent.hand.length.toString(),
                    )}
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
            {t('games.table.modals.favor.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export default FavorModal;
