import React from 'react';
import { YStack, Text } from 'tamagui';
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

export const FavorModal: React.FC<FavorModalProps> = ({
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
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            🤝 {t('games.table.modals.favor.title')}
          </ModalTitle>
          <CloseButton onPress={onClose} $variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel $variant={cardVariant as GameVariant}>
            {t('games.table.modals.favor.selectPlayer')}
          </SectionLabel>
          <Text fontSize="$3" opacity={0.8} marginBottom="$4">
            {t('games.table.modals.favor.description')}
          </Text>
          <OptionGrid>
            {aliveOpponents.map((opponent) => (
              <OptionButton
                key={opponent.playerId}
                $selected={selectedTarget === opponent.playerId}
                $variant={cardVariant as GameVariant}
                onPress={() => onSelectTarget(opponent.playerId)}
                disabled={opponent.hand.length === 0}
              >
                <Text fontSize="$6">🎮</Text>
                <YStack>
                  <Text>
                    {resolveDisplayName(
                      opponent.playerId,
                      `Player ${opponent.playerId.slice(0, 8)}`,
                    )}
                  </Text>
                  <Text fontSize="$2" opacity={0.7}>
                    {t('games.table.modals.favor.cardsCount').replace(
                      '{count}',
                      opponent.hand.length.toString(),
                    )}
                  </Text>
                </YStack>
              </OptionButton>
            ))}
          </OptionGrid>
        </ModalSection>
        <ModalActions>
          <ModalButton variant="secondary" onPress={onClose}>
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton onPress={onConfirm} disabled={!selectedTarget}>
            {t('games.table.modals.favor.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
