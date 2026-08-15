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
  Card,
  CardFrame,
  CardCorner,
  GradientScrim,
} from '../styles';
import { CardImage } from '../styles/card-image';
import { type GameVariant } from '@arcadeum/ui';
import {
  getCardTranslationKey,
  getCardName,
  getCardEmoji,
} from '../../lib/cardUtils';
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

const ComboModal: React.FC<ComboModalProps> = ({
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
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        variant={cardVariant as GameVariant}
      >
        <ModalHeader variant={cardVariant as GameVariant}>
          <ModalTitle variant={cardVariant as GameVariant}>
            {inFiverMode
              ? '🃏'
              : selectedComboCard
                ? getCardEmoji(selectedComboCard)
                : '🎴'}{' '}
            {inFiverMode
              ? t('games.table.modals.eventCombo.fiver')
              : t('games.table.modals.eventCombo.title')}
          </ModalTitle>
          <CloseButton onClick={onClose} variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>

        {/* Mode Selection - Show fiver option if available */}
        {fiverAvailable && !selectedComboCard && !inFiverMode && (
          <ModalSection>
            <SectionLabel variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectType')}
            </SectionLabel>
            <OptionGrid>
              <OptionButton active={false} onClick={() => {}}>
                <span className="text-[24px]">🎴🎴</span>
                <span className="">
                  {t('games.table.modals.eventCombo.pairTrio')}
                </span>
                <span className="text-[14px] opacity-[0.7]">
                  {t('games.table.modals.eventCombo.pairTrioDesc')}
                </span>
              </OptionButton>
              <OptionButton
                active={inFiverMode}
                onClick={() => onSelectMode('fiver')}
              >
                <span className="text-[24px]">🃏🃏🃏🃏🃏</span>
                <span className="">
                  {t('games.table.modals.eventCombo.fiver')}
                </span>
                <span className="text-[14px] opacity-[0.7]">
                  {t('games.table.modals.eventCombo.fiverDesc')}
                </span>
              </OptionButton>
            </OptionGrid>
          </ModalSection>
        )}

        {/* Combo Card Selection - only show if not in fiver mode and multiple options available */}
        {!inFiverMode && showComboSelection && (
          <ModalSection>
            <SectionLabel variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectComboCard')}
            </SectionLabel>
            <OptionGrid>
              {availableComboCards.map(({ card, availableModes }) => (
                <OptionButton
                  key={card}
                  active={selectedComboCard === card}
                  gameVariant={cardVariant as GameVariant}
                  onClick={() => onSelectComboCard(card)}
                  style={{ padding: 0, height: 'auto' }}
                >
                  <div className="flex flex-col items-center w-[100px] gap-2 p-2">
                    <Card
                      cardType={card}
                      variant={cardVariant as GameVariant}
                      className="w-full cursor-default"
                    >
                      <CardCorner position="tl" variant={cardVariant} />
                      <CardCorner position="tr" variant={cardVariant} />
                      <CardCorner position="bl" variant={cardVariant} />
                      <CardCorner position="br" variant={cardVariant} />
                      <CardFrame variant={cardVariant} />
                      <CardImage variant={cardVariant ?? ''} cardType={card} />
                      <GradientScrim />
                    </Card>
                    <span className="text-[14px] text-center w-full line-clamp-1">
                      {getCardName(card, cardVariant || 'adventure')}
                    </span>
                    <span className="text-[12px] opacity-[0.7]">
                      {availableModes.includes('trio')
                        ? t('games.table.modals.eventCombo.trioMode')
                        : t('games.table.modals.eventCombo.cardsCount', {
                            count: 2,
                          })}
                    </span>
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Mode Selection for pair/trio - only show after card is selected */}
        {!inFiverMode && selectedComboCard && currentComboData && (
          <ModalSection>
            <SectionLabel variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectMode')}
            </SectionLabel>
            <OptionGrid>
              {currentComboData.availableModes.includes('pair') && (
                <OptionButton
                  active={selectedMode === 'pair'}
                  gameVariant={cardVariant as GameVariant}
                  onClick={() => onSelectMode('pair')}
                >
                  <span className="text-[24px]">🎴🎴</span>
                  <span className="">
                    {t('games.table.modals.eventCombo.pair')}
                  </span>
                  <span className="text-[14px] opacity-[0.7]">
                    {t('games.table.modals.eventCombo.pairDesc')}
                  </span>
                </OptionButton>
              )}
              {currentComboData.availableModes.includes('trio') && (
                <OptionButton
                  active={selectedMode === 'trio'}
                  gameVariant={cardVariant as GameVariant}
                  onClick={() => onSelectMode('trio')}
                >
                  <span className="text-[24px]">🎴🎴🎴</span>
                  <span className="">
                    {t('games.table.modals.eventCombo.trio')}
                  </span>
                  <span className="text-[14px] opacity-[0.7]">
                    {t('games.table.modals.eventCombo.trioDesc')}
                  </span>
                </OptionButton>
              )}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Fiver Mode: Select 5 cards from hand */}
        {inFiverMode && (
          <ModalSection>
            <SectionLabel variant={cardVariant as GameVariant}>
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
                    active={isSelected}
                    gameVariant={cardVariant as GameVariant}
                    onClick={() => canSelect && onToggleFiverCard(card)}
                    style={{
                      padding: 0,
                      height: 'auto',
                      opacity: canSelect ? 1 : 0.5,
                    }}
                  >
                    <div className="flex flex-col items-center w-[100px] gap-2 p-2">
                      <Card
                        cardType={card}
                        variant={cardVariant as GameVariant}
                        className="w-full cursor-default"
                      >
                        <CardCorner position="tl" variant={cardVariant} />
                        <CardCorner position="tr" variant={cardVariant} />
                        <CardCorner position="bl" variant={cardVariant} />
                        <CardCorner position="br" variant={cardVariant} />
                        <CardFrame variant={cardVariant} />
                        <CardImage
                          variant={cardVariant ?? ''}
                          cardType={card}
                        />
                        <GradientScrim />
                      </Card>
                      <span className="text-[14px] text-center line-clamp-1">
                        {t(getCardTranslationKey(card, cardVariant)) || card}
                      </span>
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
              <SectionLabel variant={cardVariant as GameVariant}>
                {t('games.table.modals.eventCombo.pickDiscard')}
              </SectionLabel>
              <OptionGrid>
                {discardPile.map((card, idx) => (
                  <OptionButton
                    key={`discard-${card}-${idx}`}
                    active={selectedDiscardCard === card}
                    gameVariant={cardVariant as GameVariant}
                    onClick={() => onSelectDiscardCard(card)}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    <div className="flex flex-col items-center w-[100px] gap-2 p-2">
                      <Card
                        cardType={card}
                        variant={cardVariant as GameVariant}
                        className="w-full cursor-default"
                      >
                        <CardCorner position="tl" variant={cardVariant} />
                        <CardCorner position="tr" variant={cardVariant} />
                        <CardCorner position="bl" variant={cardVariant} />
                        <CardCorner position="br" variant={cardVariant} />
                        <CardFrame variant={cardVariant} />
                        <CardImage
                          variant={cardVariant ?? ''}
                          cardType={card}
                        />
                        <GradientScrim />
                      </Card>
                      <span className="text-[14px] text-center line-clamp-1">
                        {t(getCardTranslationKey(card, cardVariant)) || card}
                      </span>
                    </div>
                  </OptionButton>
                ))}
              </OptionGrid>
            </ModalSection>
          )}

        {/* Target Selection - only show for pair/trio after card is selected */}
        {!inFiverMode && selectedComboCard && (
          <ModalSection>
            <SectionLabel variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectTarget')}
            </SectionLabel>
            <OptionGrid>
              {aliveOpponents.map((opponent) => (
                <OptionButton
                  key={opponent.playerId}
                  active={selectedTarget === opponent.playerId}
                  gameVariant={cardVariant as GameVariant}
                  onClick={() => onSelectTarget(opponent.playerId)}
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
                      {t('games.table.modals.eventCombo.cardsCount', {
                        count: opponent.hand.length,
                      })}
                    </span>
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}
        {/* Card Index Selection for Pair */}
        {selectedMode === 'pair' && selectedTarget && targetHandSize > 0 && (
          <ModalSection>
            <SectionLabel variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.pickCardBlind')}
            </SectionLabel>
            <OptionGrid>
              {Array.from({ length: targetHandSize }, (_, index) => (
                <OptionButton
                  key={index}
                  active={selectedIndex === index}
                  gameVariant={cardVariant as GameVariant}
                  onClick={() => onSelectIndex(index)}
                >
                  <span className="text-[24px]">🎴</span>
                  <span className="text-[16px] font-semibold">
                    {t('games.table.modals.eventCombo.cardLabel', {
                      index: index + 1,
                    })}
                  </span>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Card Type Selection for Trio */}
        {selectedMode === 'trio' && (
          <ModalSection>
            <SectionLabel variant={cardVariant as GameVariant}>
              {t('games.table.modals.eventCombo.selectCard')}
            </SectionLabel>
            <OptionGrid>
              {ALL_GAME_CARDS.filter((c) => c !== 'critical_event').map(
                (card) => (
                  <OptionButton
                    key={card}
                    active={selectedCard === card}
                    gameVariant={cardVariant as GameVariant}
                    onClick={() => onSelectCard(card as CriticalCard)}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    <div className="flex flex-col items-center w-[100px] gap-2 p-2">
                      <Card
                        cardType={card as CriticalCard}
                        variant={cardVariant as GameVariant}
                        className="w-full cursor-default"
                      >
                        <CardCorner position="tl" variant={cardVariant} />
                        <CardCorner position="tr" variant={cardVariant} />
                        <CardCorner position="bl" variant={cardVariant} />
                        <CardCorner position="br" variant={cardVariant} />
                        <CardFrame variant={cardVariant} />
                        <CardImage
                          variant={cardVariant ?? ''}
                          cardType={card as string}
                        />
                        <GradientScrim />
                      </Card>
                      <span className="text-[14px] text-center line-clamp-1">
                        {getCardName(
                          card as CriticalCard,
                          cardVariant || 'adventure',
                        )}
                      </span>
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

export default ComboModal;
