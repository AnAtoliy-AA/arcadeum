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
import { getCardEmoji, getCardTranslationKey } from '../../lib/cardUtils';
import { FIVER_COMBO_SIZE, ALL_GAME_CARDS } from '../../types';
import type {
  CriticalCard,
  CriticalCatCard,
  CatComboModalState,
} from '../../types';

interface CatComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  catComboModal: CatComboModalState | null;
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
  onSelectCat: (cat: CriticalCatCard) => void;
  onSelectMode: (mode: 'pair' | 'trio' | 'fiver') => void;
  onSelectTarget: (target: string) => void;
  onSelectCard: (card: CriticalCard) => void;
  onSelectIndex: (index: number) => void;
  onSelectDiscardCard: (card: CriticalCard) => void;
  onToggleFiverCard: (card: CriticalCard) => void;
  onConfirm: () => void;
  resolveDisplayName: (playerId?: string, fallback?: string) => string;
  t: (key: string, params?: Record<string, unknown>) => string;
  cardVariant?: string;
}

export const CatComboModal: React.FC<CatComboModalProps> = ({
  isOpen,
  onClose,
  catComboModal,
  selectedMode,
  selectedTarget,
  selectedCard,
  selectedIndex,
  selectedDiscardCard,
  selectedFiverCards,
  aliveOpponents,
  selfHand,
  discardPile,
  onSelectCat,
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
  if (!isOpen || !catComboModal) return null;

  const { availableCats, selectedCat, fiverAvailable } = catComboModal;
  const currentCatData = selectedCat
    ? availableCats.find((c) => c.cat === selectedCat)
    : null;
  const targetOpponent = aliveOpponents.find(
    (o) => o.playerId === selectedTarget,
  );
  const targetHandSize = targetOpponent?.hand.length ?? 0;
  const showCatSelection = availableCats.length > 1;

  // Get unique cards from hand for fiver selection
  const uniqueHandCards = selfHand.filter(
    (card, index) => selfHand.indexOf(card) === index,
  );

  // Check if we're in fiver mode
  const inFiverMode = selectedMode === 'fiver';

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} $variant={cardVariant}>
        <ModalHeader $variant={cardVariant}>
          <ModalTitle $variant={cardVariant}>
            {inFiverMode
              ? '🃏'
              : selectedCat
                ? getCardEmoji(selectedCat)
                : '🐱'}{' '}
            {inFiverMode
              ? 'Fiver Combo (5 Cards)'
              : t('games.table.modals.catCombo.title')}
          </ModalTitle>
          <CloseButton onClick={onClose} $variant={cardVariant}>
            ×
          </CloseButton>
        </ModalHeader>

        {/* Mode Selection - Show fiver option if available */}
        {fiverAvailable && !selectedCat && !inFiverMode && (
          <ModalSection>
            <SectionLabel $variant={cardVariant}>
              Select Combo Type
            </SectionLabel>
            <OptionGrid>
              <OptionButton $selected={false} onClick={() => {}}>
                <div style={{ fontSize: '1.5rem' }}>🎴🎴</div>
                <div>Pair/Trio</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  Select a cat card below
                </div>
              </OptionButton>
              <OptionButton
                $selected={inFiverMode}
                onClick={() => onSelectMode('fiver')}
              >
                <div style={{ fontSize: '1.5rem' }}>🃏🃏🃏🃏🃏</div>
                <div>Fiver</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                  Any 5 different cards
                </div>
              </OptionButton>
            </OptionGrid>
          </ModalSection>
        )}

        {/* Cat Selection - only show if not in fiver mode and multiple cats available */}
        {!inFiverMode && showCatSelection && (
          <ModalSection>
            <SectionLabel $variant={cardVariant}>Select Cat Card</SectionLabel>
            <OptionGrid>
              {availableCats.map(({ cat, availableModes }) => (
                <OptionButton
                  key={cat}
                  $selected={selectedCat === cat}
                  $variant={cardVariant}
                  onClick={() => onSelectCat(cat)}
                >
                  <div style={{ fontSize: '1.5rem' }}>{getCardEmoji(cat)}</div>
                  <div>{t(getCardTranslationKey(cat, cardVariant))}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {availableModes.includes('trio') ? '2-3 cards' : '2 cards'}
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Mode Selection for pair/trio - only show after cat is selected */}
        {!inFiverMode && selectedCat && currentCatData && (
          <ModalSection>
            <SectionLabel $variant={cardVariant}>
              {t('games.table.modals.catCombo.selectMode')}
            </SectionLabel>
            <OptionGrid>
              {currentCatData.availableModes.includes('pair') && (
                <OptionButton
                  $selected={selectedMode === 'pair'}
                  $variant={cardVariant}
                  onClick={() => onSelectMode('pair')}
                >
                  <div style={{ fontSize: '1.5rem' }}>🎴🎴</div>
                  <div>{t('games.table.modals.catCombo.pair')}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {t('games.table.modals.catCombo.pairDesc')}
                  </div>
                </OptionButton>
              )}
              {currentCatData.availableModes.includes('trio') && (
                <OptionButton
                  $selected={selectedMode === 'trio'}
                  $variant={cardVariant}
                  onClick={() => onSelectMode('trio')}
                >
                  <div style={{ fontSize: '1.5rem' }}>🎴🎴🎴</div>
                  <div>{t('games.table.modals.catCombo.trio')}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {t('games.table.modals.catCombo.trioDesc')}
                  </div>
                </OptionButton>
              )}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Fiver Mode: Select 5 cards from hand */}
        {inFiverMode && (
          <ModalSection>
            <SectionLabel $variant={cardVariant}>
              Select {FIVER_COMBO_SIZE} different cards (
              {selectedFiverCards.length}/{FIVER_COMBO_SIZE})
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
                    $variant={cardVariant}
                    onClick={() => canSelect && onToggleFiverCard(card)}
                    style={{ opacity: canSelect ? 1 : 0.5 }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>
                      {getCardEmoji(card)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {t(getCardTranslationKey(card, cardVariant)) || card}
                    </div>
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
              <SectionLabel $variant={cardVariant}>
                Pick a card from the discard pile
              </SectionLabel>
              <OptionGrid>
                {discardPile.map((card, idx) => (
                  <OptionButton
                    key={`discard-${card}-${idx}`}
                    $selected={selectedDiscardCard === card}
                    $variant={cardVariant}
                    onClick={() => onSelectDiscardCard(card)}
                  >
                    <div style={{ fontSize: '1.5rem' }}>
                      {getCardEmoji(card)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {t(getCardTranslationKey(card, cardVariant)) || card}
                    </div>
                  </OptionButton>
                ))}
              </OptionGrid>
            </ModalSection>
          )}

        {/* Target Selection - only show for pair/trio after cat is selected */}
        {!inFiverMode && selectedCat && (
          <ModalSection>
            <SectionLabel $variant={cardVariant}>
              {t('games.table.modals.catCombo.selectTarget')}
            </SectionLabel>
            <OptionGrid>
              {aliveOpponents.map((opponent) => (
                <OptionButton
                  key={opponent.playerId}
                  $selected={selectedTarget === opponent.playerId}
                  onClick={() => onSelectTarget(opponent.playerId)}
                >
                  <div style={{ fontSize: '1.5rem' }}>🎮</div>
                  <div>
                    {resolveDisplayName(
                      opponent.playerId,
                      `Player ${opponent.playerId.slice(0, 8)}`,
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {t('games.table.modals.catCombo.cardsCount').replace(
                      '{count}',
                      opponent.hand.length.toString(),
                    )}
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Card Index Selection for Pair */}
        {selectedMode === 'pair' && selectedTarget && targetHandSize > 0 && (
          <ModalSection>
            <SectionLabel $variant={cardVariant}>
              Pick a card (blind)
            </SectionLabel>
            <OptionGrid>
              {Array.from({ length: targetHandSize }, (_, index) => (
                <OptionButton
                  key={index}
                  $selected={selectedIndex === index}
                  onClick={() => onSelectIndex(index)}
                >
                  <div style={{ fontSize: '1.5rem' }}>🎴</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Card {index + 1}
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Card Type Selection for Trio */}
        {selectedMode === 'trio' && (
          <ModalSection>
            <SectionLabel $variant={cardVariant}>
              {t('games.table.modals.catCombo.selectCard')}
            </SectionLabel>
            <OptionGrid>
              {ALL_GAME_CARDS.filter((c) => c !== 'critical_event').map(
                (card) => (
                  <OptionButton
                    key={card}
                    $selected={selectedCard === card}
                    $variant={cardVariant}
                    onClick={() => onSelectCard(card as CriticalCard)}
                  >
                    <div style={{ fontSize: '1.5rem' }}>
                      {getCardEmoji(card as CriticalCard)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {t(
                        getCardTranslationKey(
                          card as CriticalCard,
                          cardVariant,
                        ),
                      ) || card}
                    </div>
                  </OptionButton>
                ),
              )}
            </OptionGrid>
          </ModalSection>
        )}

        <ModalActions>
          <ModalButton variant="secondary" onClick={onClose}>
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton
            onClick={onConfirm}
            disabled={
              inFiverMode
                ? selectedFiverCards.length !== FIVER_COMBO_SIZE ||
                  !selectedDiscardCard
                : !selectedCat ||
                  !selectedTarget ||
                  (selectedMode === 'trio' && !selectedCard) ||
                  (selectedMode === 'pair' && selectedIndex === null)
            }
          >
            {t('games.table.modals.catCombo.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
