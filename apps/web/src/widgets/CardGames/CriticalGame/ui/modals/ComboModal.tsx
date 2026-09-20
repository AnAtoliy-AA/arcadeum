import React, { useEffect } from 'react';
import { Button, CloseIcon } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalActions,
} from '@/features/games/ui/SharedModal';
import { getCardName } from '../../lib/cardUtils';
import { FIVER_COMBO_SIZE } from '../../types';
import type { CriticalCard, EventComboModalState } from '../../types';
import { BlindCardPicker } from './BlindCardPicker';
import { TrioCardPicker } from './TrioCardPicker';
import { FiverDiscardPicker } from './FiverDiscardPicker';

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
  onSelectComboCard: (card: CriticalCard) => void;
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
  let effectiveTarget = selectedTarget;
  if (!effectiveTarget && aliveOpponents.length === 1) {
    effectiveTarget = aliveOpponents[0].playerId;
  }

  useEffect(() => {
    if (!selectedTarget && effectiveTarget) {
      onSelectTarget(effectiveTarget);
    }
  }, [selectedTarget, effectiveTarget, onSelectTarget]);

  if (!isOpen || !comboModal) return null;

  const { availableComboCards, selectedComboCard } = comboModal;
  const currentComboData = selectedComboCard
    ? availableComboCards.find((c) => c.card === selectedComboCard)
    : null;
  const targetOpponent = aliveOpponents.find(
    (o) => o.playerId === effectiveTarget,
  );
  const targetHandSize = targetOpponent?.hand.length ?? 0;
  const inFiverMode = selectedMode === 'fiver';

  const getModalTitle = () => {
    if (inFiverMode) return `✨ ${t('games.table.modals.eventCombo.fiver')}`;
    if (selectedMode === 'pair')
      return `🎴🎴 ${t('games.table.modals.eventCombo.pair')}`;
    if (selectedMode === 'trio')
      return `🎴🎴🎴 ${t('games.table.modals.eventCombo.trio')}`;
    return `🎴 ${t('games.table.modals.eventCombo.title')}`;
  };
  const modalTitle = getModalTitle();

  const targetName = targetOpponent
    ? resolveDisplayName(
        targetOpponent.playerId,
        `Player ${targetOpponent.playerId.slice(0, 8)}`,
      )
    : undefined;

  const checkConfirmDisabled = () => {
    if (inFiverMode) {
      return (
        selectedFiverCards.length !== FIVER_COMBO_SIZE || !selectedDiscardCard
      );
    }
    if (!selectedComboCard || !effectiveTarget) return true;
    if (selectedMode === 'trio') return !selectedCard;
    if (selectedMode === 'pair') return selectedIndex === null;
    return true;
  };
  const isConfirmDisabled = checkConfirmDisabled();

  const showModeSelection =
    !inFiverMode &&
    !selectedMode &&
    currentComboData &&
    currentComboData.availableModes.length > 1;

  const showCardSelection =
    !inFiverMode && availableComboCards.length > 1 && !selectedComboCard;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        maxWidth={680}
        variant={cardVariant}
        data-testid="combo-modal"
        header={
          <ModalHeader variant={cardVariant} className="px-5 pt-5 pb-3">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <ModalTitle variant={cardVariant} className="text-xl">
                {modalTitle}
              </ModalTitle>
              {selectedComboCard && !inFiverMode && (
                <span className="text-xs text-slate-300 font-medium">
                  {selectedMode === 'trio'
                    ? t('games.table.modals.eventCombo.trio')
                    : t('games.table.modals.eventCombo.pair')}{' '}
                  · {getCardName(selectedComboCard, cardVariant || 'adventure')}
                </span>
              )}
            </div>
            <CloseButton
              onClick={onClose}
              aria-label="Close modal"
              title="Close"
              data-testid="combo-modal-close-button"
            >
              <CloseIcon size={20} />
            </CloseButton>
          </ModalHeader>
        }
        footer={
          <ModalActions className="shrink-0 justify-end px-5 py-3 border-t border-white/10">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {t('games.table.modals.common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isConfirmDisabled}
              onClick={onConfirm}
              data-testid="combo-confirm-button"
              className={cx(
                isConfirmDisabled
                  ? 'opacity-40 cursor-not-allowed bg-white/10 text-white/40 border-white/10'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/30',
              )}
            >
              {t('games.table.modals.eventCombo.confirm')}
            </Button>
          </ModalActions>
        }
      >
        <div className="flex flex-col gap-5 py-2">
          {showCardSelection && (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {t('games.table.modals.eventCombo.selectComboCard')}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableComboCards.map(({ card, availableModes }) => (
                  <button
                    key={card}
                    type="button"
                    onClick={() => onSelectComboCard(card)}
                    className={cx(
                      'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer text-left',
                      selectedComboCard === card
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]',
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {getCardName(card, cardVariant || 'adventure')}
                    </span>
                    <span className="text-xs text-slate-300">
                      (
                      {availableModes.includes('trio')
                        ? t('games.table.modals.eventCombo.trioMode')
                        : t('games.table.modals.eventCombo.cardsCount', {
                            count: 2,
                          })}
                      )
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showModeSelection && currentComboData && (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {t('games.table.modals.eventCombo.selectMode')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentComboData.availableModes.includes('pair') && (
                  <button
                    type="button"
                    onClick={() => onSelectMode('pair')}
                    className={cx(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer',
                      selectedMode === 'pair'
                        ? 'border-amber-400 bg-amber-400/15'
                        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]',
                    )}
                  >
                    <span className="text-xl">🎴🎴</span>
                    <span className="text-sm font-semibold">
                      {t('games.table.modals.eventCombo.pair')}
                    </span>
                    <span className="text-xs text-slate-300 text-center">
                      {t('games.table.modals.eventCombo.pairDesc')}
                    </span>
                  </button>
                )}
                {currentComboData.availableModes.includes('trio') && (
                  <button
                    type="button"
                    onClick={() => onSelectMode('trio')}
                    className={cx(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer',
                      selectedMode === 'trio'
                        ? 'border-amber-400 bg-amber-400/15'
                        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]',
                    )}
                  >
                    <span className="text-xl">🎴🎴🎴</span>
                    <span className="text-sm font-semibold">
                      {t('games.table.modals.eventCombo.trio')}
                    </span>
                    <span className="text-xs text-slate-300 text-center">
                      {t('games.table.modals.eventCombo.trioDesc')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {!inFiverMode && (
            <div className="flex flex-col gap-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {t('games.table.modals.eventCombo.selectTarget')}
              </div>
              {aliveOpponents.length > 1 ? (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  data-testid="target-opponents-grid"
                >
                  {aliveOpponents.map((opponent) => {
                    const isSelected = effectiveTarget === opponent.playerId;
                    return (
                      <button
                        key={opponent.playerId}
                        type="button"
                        onClick={() => onSelectTarget(opponent.playerId)}
                        data-testid={`target-opponent-${opponent.playerId}`}
                        aria-pressed={isSelected}
                        className={cx(
                          'flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left',
                          isSelected
                            ? 'border-amber-400 bg-amber-400/15 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50'
                            : 'border-white/15 bg-white/[0.06] hover:bg-white/[0.1] hover:border-white/30',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <span className="text-sm font-semibold text-white line-clamp-1">
                            {resolveDisplayName(
                              opponent.playerId,
                              `Player ${opponent.playerId.slice(0, 8)}`,
                            )}
                          </span>
                        </div>
                        <span className="text-xs text-slate-200 px-2.5 py-0.5 rounded-full bg-white/10 font-medium">
                          {t('games.table.modals.eventCombo.cardsCount', {
                            count: opponent.hand.length,
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/15 bg-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span className="text-sm font-semibold text-white">
                      {targetName || 'Opponent'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-200 px-2.5 py-0.5 rounded-full bg-white/10 font-medium">
                    {t('games.table.modals.eventCombo.cardsCount', {
                      count: targetHandSize,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {selectedMode === 'pair' && effectiveTarget && targetHandSize > 0 && (
            <BlindCardPicker
              targetHandSize={targetHandSize}
              selectedIndex={selectedIndex}
              onSelectIndex={onSelectIndex}
              targetName={targetName}
              cardVariant={cardVariant}
              t={t}
            />
          )}

          {selectedMode === 'trio' && effectiveTarget && (
            <TrioCardPicker
              selectedCard={selectedCard}
              onSelectCard={onSelectCard}
              cardVariant={cardVariant}
              t={t}
            />
          )}

          {inFiverMode && (
            <FiverDiscardPicker
              selectedFiverCards={selectedFiverCards}
              selectedDiscardCard={selectedDiscardCard}
              discardPile={discardPile}
              selfHand={selfHand}
              onSelectDiscardCard={onSelectDiscardCard}
              onToggleFiverCard={onToggleFiverCard}
              cardVariant={cardVariant}
              t={t}
            />
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ComboModal;
