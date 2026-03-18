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
    <Modal open={isOpen}>
      <ModalContent
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            {emoji} {t(titleKey)}
          </ModalTitle>
          <CloseButton onPress={onClose} $variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel $variant={cardVariant as GameVariant}>
            {t(selectPlayerKey)}
          </SectionLabel>
          <Text fontSize="$3" opacity={0.8} marginBottom="$4">
            {t(descriptionKey)}
          </Text>
          <OptionGrid>
            {aliveOpponents.map((opponent) => (
              <OptionButton
                key={opponent.playerId}
                $selected={selectedTarget === opponent.playerId}
                $variant={cardVariant as GameVariant}
                onPress={() => onSelectTarget(opponent.playerId)}
                disabled={
                  opponent.hand.length === 0 &&
                  false /* Opponents don't need cards to be attacked */
                }
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
                    {t('games.table.modals.favor.cardsCount', {
                      count: opponent.hand.length,
                    })}
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
            {t('games.table.modals.common.confirm') || 'Confirm'}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
