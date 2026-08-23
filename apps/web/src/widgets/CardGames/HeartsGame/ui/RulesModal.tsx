'use client';

import { memo } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { titleKey: 'objectiveTitle', bodyKey: 'objective' },
  { titleKey: 'setupTitle', bodyKey: 'setup' },
  { titleKey: 'passingTitle', bodyKey: 'passing' },
  { titleKey: 'gameplayTitle', bodyKey: 'gameplay' },
  { titleKey: 'scoringTitle', bodyKey: 'scoring' },
] as const;

export const RulesModal = memo(function RulesModal({
  open,
  onClose,
}: RulesModalProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t('games.hearts_v1.rules.title')}</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4 text-sm">
            {SECTIONS.map((section) => (
              <section key={section.titleKey}>
                <h3 className="mb-1 flex items-center gap-2 font-bold">
                  <span aria-hidden="true" className="text-[var(--danger)]">
                    ♥
                  </span>
                  {t(
                    `games.hearts_v1.rules.${section.titleKey}` as Parameters<
                      typeof t
                    >[0],
                  )}
                </h3>
                <p className="text-[var(--muted-foreground)]">
                  {t(
                    `games.hearts_v1.rules.${section.bodyKey}` as Parameters<
                      typeof t
                    >[0],
                  )}
                </p>
              </section>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});
