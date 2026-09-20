import React, { useState } from 'react';
import type { GameVariant } from '@arcadeum/ui';
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
import { getCardDescriptionKey, getCardName } from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';
import { Card, CardCorner, CardFrame, GradientScrim } from '../styles';
import { CardImage } from '../styles/card-image';

interface GiveFavorModalProps {
  isOpen: boolean;
  requesterName: string;
  myHand: CriticalCard[];
  onGiveCard: (card: CriticalCard) => void;
  onCancel?: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  cardVariant?: string;
}

const GiveFavorModal: React.FC<GiveFavorModalProps> = ({
  isOpen,
  requesterName,
  myHand,
  onGiveCard,
  onCancel,
  t,
  cardVariant,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedIndex !== null && myHand[selectedIndex]) {
      onGiveCard(myHand[selectedIndex]);
      setSelectedIndex(null);
    }
  };

  const handleCancel = () => {
    setSelectedIndex(null);
    onCancel?.();
  };

  const gameVariant = cardVariant as GameVariant;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <ModalContent
        maxWidth={600}
        variant={cardVariant}
        data-testid="give-favor-modal"
        header={
          <ModalHeader variant={cardVariant} className="px-5 pt-5 pb-3">
            <ModalTitle variant={cardVariant} className="text-xl">
              🤲 {t('games.table.modals.giveFavor.title')}
            </ModalTitle>
            <CloseButton
              onClick={handleCancel}
              aria-label="Close modal"
              title="Close"
              data-testid="modal-close-button"
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
              onClick={handleCancel}
              data-testid="give-favor-cancel"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {t('games.table.modals.common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              disabled={selectedIndex === null}
              data-testid="give-favor-confirm"
              className={cx(
                selectedIndex === null
                  ? 'opacity-40 cursor-not-allowed bg-white/10 text-white/40 border-white/10'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/30',
              )}
            >
              {t('games.table.modals.giveFavor.confirm')}
            </Button>
          </ModalActions>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-400">
            {t('games.table.modals.giveFavor.description', {
              player: requesterName,
            })}
          </div>
          <div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1 max-h-[300px] overflow-y-auto"
            data-testid="give-favor-cards"
          >
            {myHand.map((card, index) => {
              const isSelected = selectedIndex === index;
              return (
                <button
                  key={`${card}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  data-testid={`give-favor-card-${index}`}
                  data-selected={isSelected ? 'true' : 'false'}
                  aria-pressed={isSelected}
                  className={cx(
                    'group relative flex flex-col items-center w-[92px] sm:w-[104px] shrink-0 p-1.5 sm:p-2 rounded-xl border-2 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 text-left',
                    isSelected
                      ? 'border-white bg-white/15 scale-105 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                      : 'border-transparent bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:scale-95',
                  )}
                >
                  <div className="w-full pointer-events-none">
                    <Card
                      cardType={card}
                      variant={gameVariant}
                      className="w-full cursor-pointer"
                    >
                      <CardCorner position="tl" variant={cardVariant} />
                      <CardCorner position="tr" variant={cardVariant} />
                      <CardCorner position="bl" variant={cardVariant} />
                      <CardCorner position="br" variant={cardVariant} />
                      <CardFrame variant={cardVariant} />
                      <CardImage variant={cardVariant ?? ''} cardType={card} />
                      <GradientScrim />
                    </Card>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-center w-full line-clamp-1 mt-1 text-white">
                    {getCardName(card, cardVariant || 'adventure')}
                  </span>
                  <span className="text-[11px] text-white/70 text-center line-clamp-2">
                    {t(getCardDescriptionKey(card))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default GiveFavorModal;
