'use client';

import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface ArcadePetCommitmentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ArcadePetCommitmentModal: React.FC<
  ArcadePetCommitmentModalProps
> = ({ open, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [pledgeChecked, setPledgeChecked] = useState(false);

  const handleAdopt = () => {
    if (!pledgeChecked) return;
    onConfirm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabelledBy="arcade-pet-commitment-title"
    >
      <ModalContent data-testid="arcade-pet-commitment-modal" maxWidth={448}>
        <ModalHeader
          onClose={onClose}
          closeLabel={t('arcadePetCompanion.close')}
        >
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-2xl">
              🥚
            </span>
            <div className="flex flex-col">
              <span
                id="arcade-pet-commitment-title"
                className="text-base font-bold text-[var(--color)]"
              >
                {t('arcadePetCompanion.commitTitle')}
              </span>
              <span className="text-xs font-semibold text-[var(--success)]">
                {t('arcadePetCompanion.commitFree')}
              </span>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full border border-[var(--primary)] text-3xl motion-reduce:animate-none"
            >
              ✨
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-[var(--textSecondary)]">
              {t('arcadePetCompanion.commitIntro')}
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-3 transition-colors hover:border-[var(--glassBorderHover)]">
            <input
              type="checkbox"
              data-testid="care-commitment-checkbox"
              checked={pledgeChecked}
              onChange={(e) => setPledgeChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            />
            <span className="text-xs leading-snug text-[var(--color)]">
              {t('arcadePetCompanion.commitPledge')}
            </span>
          </label>
        </ModalBody>

        <ModalFooter>
          <Button variant="glass" size="sm" onClick={onClose}>
            {t('arcadePetCompanion.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            data-testid="confirm-adopt-pet-btn"
            disabled={!pledgeChecked}
            onClick={handleAdopt}
          >
            {t('arcadePetCompanion.adoptFreeAria')} 🐾
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
