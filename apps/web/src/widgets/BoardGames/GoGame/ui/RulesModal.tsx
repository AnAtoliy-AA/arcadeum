'use client';

import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  const rules = [
    { title: t('games.go_v1.rules.objectiveTitle'), body: t('games.go_v1.rules.objective') },
    { title: t('games.go_v1.rules.captureTitle'), body: t('games.go_v1.rules.capture') },
    { title: t('games.go_v1.rules.koTitle'), body: t('games.go_v1.rules.ko') },
    { title: t('games.go_v1.rules.passTitle'), body: t('games.go_v1.rules.pass') },
    { title: t('games.go_v1.rules.scoringTitle'), body: t('games.go_v1.rules.scoring') },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{t('games.go_v1.rules.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {rules.map((rule) => (
              <div key={rule.title} className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold">{rule.title}</h3>
                <p className="text-sm opacity-80">{rule.body}</p>
              </div>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
