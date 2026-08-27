import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalActions,
  ModalButton,
} from '../styles';
import { type GameVariant } from '@arcadeum/ui';

interface DefuseModalProps {
  isOpen: boolean;
  onDefuse: (position: number) => void;
  deckSize: number;
  t: (key: string) => string;
  cardVariant?: string;
}

const DefuseModal: React.FC<DefuseModalProps> = ({
  isOpen,
  onDefuse,
  deckSize,
  t,
  cardVariant,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<number>(0);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onDefuse(selectedPosition);
  };

  return (
    <Modal open={isOpen}>
      <ModalContent
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        variant={cardVariant as GameVariant}
      >
        <ModalHeader variant={cardVariant as GameVariant}>
          <ModalTitle variant={cardVariant as GameVariant}>
            🛡️ {t('games.table.modals.defuse.title')}
          </ModalTitle>
        </ModalHeader>
        <div className="mb-6 text-center opacity-[0.8]">
          {t('games.table.modals.defuse.description')}
        </div>
        <div className="mb-6 flex flex-col gap-3">
          <div className="text-center font-medium">
            {t('games.table.modals.defuse.positionLabel')}
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="min-w-[50px] text-center text-[14px] opacity-[0.6]">
              Top
            </span>
            <input
              type="range"
              className="h-10 flex-1 accent-[#10b981] min-w-[120px]"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(Number(e.target.value))}
              min={0}
              max={Math.max(0, deckSize)}
              step={1}
              aria-label={t('games.table.modals.defuse.positionLabel')}
              style={{ touchAction: 'none' }}
            />
            <span className="min-w-[50px] text-center text-[14px] opacity-[0.6]">
              Bottom
            </span>
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors min-w-[44px] min-h-[44px]"
              onClick={() => setSelectedPosition((p) => Math.max(0, p - 1))}
              disabled={selectedPosition === 0}
              aria-label="Move position up"
            >
              ←
            </button>
            <div className="flex-1 rounded-lg bg-[rgba(255,255,255,0.1)] p-3 text-center text-[16px] font-medium">
              {selectedPosition === 0
                ? 'Top of deck'
                : selectedPosition >= deckSize
                  ? 'Bottom of deck'
                  : `Position ${selectedPosition + 1} from top`}
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors min-w-[44px] min-h-[44px]"
              onClick={() =>
                setSelectedPosition((p) => Math.min(deckSize, p + 1))
              }
              disabled={selectedPosition >= deckSize}
              aria-label="Move position down"
            >
              →
            </button>
          </div>
        </div>
        <ModalActions>
          <ModalButton onClick={handleConfirm}>
            {t('games.table.modals.defuse.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export default DefuseModal;
