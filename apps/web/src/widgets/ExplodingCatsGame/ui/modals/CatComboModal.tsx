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
import { CAT_CARDS, FIVER_COMBO_SIZE } from '../../types';
import type {
  ExplodingCatsCard,
  ExplodingCatsCatCard,
  CatComboModalState,
} from '../../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface CatComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  catComboModal: CatComboModalState | null;
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: ExplodingCatsCard | null;
  selectedIndex: number | null;
  selectedDiscardCard: ExplodingCatsCard | null;
  selectedFiverCards: ExplodingCatsCard[];
  aliveOpponents: Array<{
    playerId: string;
    hand: ExplodingCatsCard[];
  }>;
  selfHand: ExplodingCatsCard[];
  discardPile: ExplodingCatsCard[];
  onSelectCat: (cat: ExplodingCatsCatCard) => void;
  onSelectMode: (mode: 'pair' | 'trio' | 'fiver') => void;
  onSelectTarget: (target: string) => void;
  onSelectCard: (card: ExplodingCatsCard) => void;
  onSelectIndex: (index: number) => void;
  onSelectDiscardCard: (card: ExplodingCatsCard) => void;
  onToggleFiverCard: (card: ExplodingCatsCard) => void;
  onConfirm: () => void;
  resolveDisplayName: (playerId?: string, fallback?: string) => string;
  t: (key: TranslationKey) => string;
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
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {inFiverMode
              ? '🃏'
              : selectedCat
                ? getCardEmoji(selectedCat)
                : '🐱'}{' '}
            {inFiverMode
              ? 'Fiver Combo (5 Cards)'
              : t('games.table.modals.catCombo.title')}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {/* Mode Selection - Show fiver option if available */}
        {fiverAvailable && !selectedCat && !inFiverMode && (
          <ModalSection>
            <SectionLabel>Select Combo Type</SectionLabel>
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
            <SectionLabel>Select Cat Card</SectionLabel>
            <OptionGrid>
              {availableCats.map(({ cat, availableModes }) => (
                <OptionButton
                  key={cat}
                  $selected={selectedCat === cat}
                  onClick={() => onSelectCat(cat)}
                >
                  <div style={{ fontSize: '1.5rem' }}>{getCardEmoji(cat)}</div>
                  <div>{t(getCardTranslationKey(cat))}</div>
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
            <SectionLabel>
              {t('games.table.modals.catCombo.selectMode')}
            </SectionLabel>
            <OptionGrid>
              {currentCatData.availableModes.includes('pair') && (
                <OptionButton
                  $selected={selectedMode === 'pair'}
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
            <SectionLabel>
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
                    onClick={() => canSelect && onToggleFiverCard(card)}
                    style={{ opacity: canSelect ? 1 : 0.5 }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>
                      {getCardEmoji(card)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {t(getCardTranslationKey(card)) || card}
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
              <SectionLabel>Pick a card from the discard pile</SectionLabel>
              <OptionGrid>
                {discardPile.map((card, idx) => (
                  <OptionButton
                    key={`discard-${card}-${idx}`}
                    $selected={selectedDiscardCard === card}
                    onClick={() => onSelectDiscardCard(card)}
                  >
                    <div style={{ fontSize: '1.5rem' }}>
                      {getCardEmoji(card)}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {t(getCardTranslationKey(card)) || card}
                    </div>
                  </OptionButton>
                ))}
              </OptionGrid>
            </ModalSection>
          )}

        {/* Target Selection - only show for pair/trio after cat is selected */}
        {!inFiverMode && selectedCat && (
          <ModalSection>
            <SectionLabel>
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
            <SectionLabel>Pick a card (blind)</SectionLabel>
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
            <SectionLabel>
              {t('games.table.modals.catCombo.selectCard')}
            </SectionLabel>
            <OptionGrid>
              {[
                'defuse',
                'attack',
                'skip',
                'favor',
                'shuffle',
                'see_the_future',
                ...CAT_CARDS,
              ].map((card) => (
                <OptionButton
                  key={card}
                  $selected={selectedCard === card}
                  onClick={() => onSelectCard(card as ExplodingCatsCard)}
                >
                  <div style={{ fontSize: '1.5rem' }}>
                    {getCardEmoji(card as ExplodingCatsCard)}
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    {t(getCardTranslationKey(card as ExplodingCatsCard)) ||
                      card}
                  </div>
                </OptionButton>
              ))}
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
