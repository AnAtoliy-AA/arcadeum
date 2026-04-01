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
import { getCardEmoji, getCardTranslationKey } from '../../lib/cardUtils';
import { FIVER_COMBO_SIZE, ALL_GAME_CARDS } from '../../types';
import type {
  CriticalCard,
  CriticalComboCard,
  EventComboModalState,
} from '../../types';

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  comboModal: EventComboModalState | null;
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: CriticalCard | null;
  selectedIndex: number | null;
  selectedDiscardCard: CriticalCard | null;
  selectedFiverCards: CriticalCard[];
  aliveOpponents: Array<{
    playerId: string;
    hand: CriticalCard[];
  }>;
  selfHand: CriticalCard[];
  discardPile: CriticalCard[];
  onSelectComboCard: (card: CriticalComboCard) => void;
  onSelectMode: (mode: 'pair' | 'trio' | 'fiver') => void;
  onSelectTarget: (target: string) => void;
  onSelectCard: (card: CriticalCard) => void;
  onSelectIndex: (index: number) => void;
  onSelectDiscardCard: (card: CriticalCard) => void;
  onToggleFiverCard: (card: CriticalCard) => void;
  onConfirm: () => void;
  resolveDisplayName: (playerId?: string, fallback?: string) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
  cardVariant?: string;
}

export const ComboModal: React.FC<ComboModalProps> = ({
  isOpen,
  onClose,
  comboModal,
  selectedMode,
  selectedTarget,
  selectedCard,
  selectedIndex,
  selectedDiscardCard,
  selectedFiverCards,
  aliveOpponents,
  selfHand,
  discardPile,
  onSelectComboCard,
  onSelectMode,
  onSelectTarget,
  onSelectCard,
  onSelectIndex,
  onSelectDiscardCard,
  onToggleFiverCard,
  onConfirm,
  resolveDisplayName,
  t,
  cardVariant,
}) => {
  if (!isOpen || !comboModal) return null;

  const { availableComboCards, selectedComboCard, fiverAvailable } = comboModal;
  const currentComboData = selectedComboCard
    ? availableComboCards.find((c) => c.card === selectedComboCard)
    : null;
  const targetOpponent = aliveOpponents.find(
    (o) => o.playerId === selectedTarget,
  );
  const targetHandSize = targetOpponent?.hand.length ?? 0;
  const showComboSelection = availableComboCards.length > 1;

  // Get unique cards from hand for fiver selection
  const uniqueHandCards = selfHand.filter(
    (card, index) => selfHand.indexOf(card) === index,
  );

  // Check if we're in fiver mode
  const inFiverMode = selectedMode === 'fiver';

  return (
    <Modal open={isOpen}>
      <ModalContent
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            {inFiverMode
              ? '🃏'
              : selectedComboCard
                ? getCardEmoji(selectedComboCard)
                : '🎴'}{' '}
            {inFiverMode
              ? t('games.table.modals.eventCombo.fiver')
              : t('games.table.modals.eventCombo.title')}
          </ModalTitle>
          <CloseButton onPress={onClose} $variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>

        {/* Mode Selection - Show fiver option if available */}
        {fiverAvailable && !selectedComboCard && !inFiverMode && (
          <ModalSection>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectType')}
            </SectionLabel>
            <OptionGrid>
              <OptionButton $selected={false} onPress={() => {}}>
                <Text fontSize="$6">🎴🎴</Text>
                <Text>{t('games.table.modals.eventCombo.pairTrio')}</Text>
                <Text fontSize="$2" opacity={0.7}>
                  {t('games.table.modals.eventCombo.pairTrioDesc')}
                </Text>
              </OptionButton>
              <OptionButton
                $selected={inFiverMode}
                onPress={() => onSelectMode('fiver')}
              >
                <Text fontSize="$6">🃏🃏🃏🃏🃏</Text>
                <Text>{t('games.table.modals.eventCombo.fiver')}</Text>
                <Text fontSize="$2" opacity={0.7}>
                  {t('games.table.modals.eventCombo.fiverDesc')}
                </Text>
              </OptionButton>
            </OptionGrid>
          </ModalSection>
        )}

        {/* Combo Card Selection - only show if not in fiver mode and multiple options available */}
        {!inFiverMode && showComboSelection && (
          <ModalSection>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectComboCard')}
            </SectionLabel>
            <OptionGrid>
              {availableComboCards.map(({ card, availableModes }) => (
                <OptionButton
                  key={card}
                  $selected={selectedComboCard === card}
                  $variant={cardVariant as GameVariant}
                  onPress={() => onSelectComboCard(card)}
                >
                  <Text fontSize="$6">{getCardEmoji(card)}</Text>
                  <Text>{t(getCardTranslationKey(card, cardVariant))}</Text>
                  <Text fontSize="$2" opacity={0.7}>
                    {availableModes.includes('trio')
                      ? t('games.table.modals.eventCombo.trioMode')
                      : t('games.table.modals.eventCombo.cardsCount', {
                          count: 2,
                        })}
                  </Text>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Mode Selection for pair/trio - only show after card is selected */}
        {!inFiverMode && selectedComboCard && currentComboData && (
          <ModalSection>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectMode')}
            </SectionLabel>
            <OptionGrid>
              {currentComboData.availableModes.includes('pair') && (
                <OptionButton
                  $selected={selectedMode === 'pair'}
                  $variant={cardVariant as GameVariant}
                  onPress={() => onSelectMode('pair')}
                >
                  <Text fontSize="$6">🎴🎴</Text>
                  <Text>{t('games.table.modals.eventCombo.pair')}</Text>
                  <Text fontSize="$2" opacity={0.7}>
                    {t('games.table.modals.eventCombo.pairDesc')}
                  </Text>
                </OptionButton>
              )}
              {currentComboData.availableModes.includes('trio') && (
                <OptionButton
                  $selected={selectedMode === 'trio'}
                  $variant={cardVariant as GameVariant}
                  onPress={() => onSelectMode('trio')}
                >
                  <Text fontSize="$6">🎴🎴🎴</Text>
                  <Text>{t('games.table.modals.eventCombo.trio')}</Text>
                  <Text fontSize="$2" opacity={0.7}>
                    {t('games.table.modals.eventCombo.trioDesc')}
                  </Text>
                </OptionButton>
              )}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Fiver Mode: Select 5 cards from hand */}
        {inFiverMode && (
          <ModalSection>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.stashCards', {
                count: FIVER_COMBO_SIZE,
              })}{' '}
              ({selectedFiverCards.length}/{FIVER_COMBO_SIZE})
            </SectionLabel>
            <OptionGrid>
              {uniqueHandCards.map((card, idx) => {
                const isSelected = selectedFiverCards.includes(card);
                const canSelect =
                  isSelected || selectedFiverCards.length < FIVER_COMBO_SIZE;
                return (
                  <OptionButton
                    key={`${card}-${idx}`}
                    $selected={isSelected}
                    $variant={cardVariant as GameVariant}
                    onPress={() => canSelect && onToggleFiverCard(card)}
                    opacity={canSelect ? 1 : 0.5}
                  >
                    <Text fontSize="$6">{getCardEmoji(card)}</Text>
                    <Text fontSize="$2">
                      {t(getCardTranslationKey(card, cardVariant)) || card}
                    </Text>
                  </OptionButton>
                );
              })}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Fiver Mode: Select card from discard pile */}
        {inFiverMode &&
          selectedFiverCards.length === FIVER_COMBO_SIZE &&
          discardPile.length > 0 && (
            <ModalSection>
              <SectionLabel $variant={cardVariant as GameVariant}>
                {t('games.table.modals.eventCombo.pickDiscard')}
              </SectionLabel>
              <OptionGrid>
                {discardPile.map((card, idx) => (
                  <OptionButton
                    key={`discard-${card}-${idx}`}
                    $selected={selectedDiscardCard === card}
                    $variant={cardVariant as GameVariant}
                    onPress={() => onSelectDiscardCard(card)}
                  >
                    <Text fontSize="$6">{getCardEmoji(card)}</Text>
                    <Text fontSize="$2">
                      {t(getCardTranslationKey(card, cardVariant)) || card}
                    </Text>
                  </OptionButton>
                ))}
              </OptionGrid>
            </ModalSection>
          )}

        {/* Target Selection - only show for pair/trio after card is selected */}
        {!inFiverMode && selectedComboCard && (
          <ModalSection>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectTarget')}
            </SectionLabel>
            <OptionGrid>
              {aliveOpponents.map((opponent) => (
                <OptionButton
                  key={opponent.playerId}
                  $selected={selectedTarget === opponent.playerId}
                  $variant={cardVariant as GameVariant}
                  onPress={() => onSelectTarget(opponent.playerId)}
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
                      {t('games.table.modals.eventCombo.cardsCount', {
                        count: opponent.hand.length,
                      })}
                    </Text>
                  </YStack>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}
        {/* Card Index Selection for Pair */}
        {selectedMode === 'pair' && selectedTarget && targetHandSize > 0 && (
          <ModalSection>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.pickCardBlind')}
            </SectionLabel>
            <OptionGrid>
              {Array.from({ length: targetHandSize }, (_, index) => (
                <OptionButton
                  key={index}
                  $selected={selectedIndex === index}
                  $variant={cardVariant as GameVariant}
                  onPress={() => onSelectIndex(index)}
                >
                  <Text fontSize="$6">🎴</Text>
                  <Text fontSize="$3" fontWeight="600">
                    {t('games.table.modals.eventCombo.cardLabel', {
                      index: index + 1,
                    })}
                  </Text>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Card Type Selection for Trio */}
        {selectedMode === 'trio' && (
          <ModalSection>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectCard')}
            </SectionLabel>
            <OptionGrid>
              {ALL_GAME_CARDS.filter((c) => c !== 'critical_event').map(
                (card) => (
                  <OptionButton
                    key={card}
                    $selected={selectedCard === card}
                    $variant={cardVariant as GameVariant}
                    onPress={() => onSelectCard(card as CriticalCard)}
                  >
                    <Text fontSize="$6">
                      {getCardEmoji(card as CriticalCard)}
                    </Text>
                    <Text fontSize="$2">
                      {t(
                        getCardTranslationKey(
                          card as CriticalCard,
                          cardVariant,
                        ),
                      ) || card}
                    </Text>
                  </OptionButton>
                ),
              )}
            </OptionGrid>
          </ModalSection>
        )}

        <ModalActions>
          <ModalButton variant="secondary" onPress={onClose}>
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton
            onPress={onConfirm}
            disabled={
              inFiverMode
                ? selectedFiverCards.length !== FIVER_COMBO_SIZE ||
                  !selectedDiscardCard
                : !selectedComboCard ||
                  !selectedTarget ||
                  (selectedMode === 'trio' && !selectedCard) ||
                  (selectedMode === 'pair' && selectedIndex === null)
            }
          >
            {t('games.table.modals.eventCombo.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
