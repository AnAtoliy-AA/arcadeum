'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  const { t } = useTranslation();

  const sections = [
    {
      icon: '🎯',
      gradient: 'from-rose-500 to-rose-700',
      header: t('games.backgammon_v1.rules.objectiveTitle'),
      body: t('games.backgammon_v1.rules.objective'),
    },
    {
      icon: '🎲',
      gradient: 'from-amber-400 to-amber-600',
      header: t('games.backgammon_v1.rules.movementTitle'),
      body: t('games.backgammon_v1.rules.movement'),
    },
    {
      icon: '⚡',
      gradient: 'from-purple-500 to-purple-700',
      header: t('games.backgammon_v1.rules.hittingTitle'),
      body: t('games.backgammon_v1.rules.hitting'),
    },
    {
      icon: '🏆',
      gradient: 'from-emerald-500 to-emerald-700',
      header: t('games.backgammon_v1.rules.bearingOffTitle'),
      body: t('games.backgammon_v1.rules.bearingOff'),
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={720} data-testid="backgammon-rules-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{t('games.backgammon_v1.rules.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-stretch gap-6">
            {sections.map((section) => (
              <div
                className="flex flex-col items-stretch gap-3"
                key={section.header}
              >
                <div className="flex flex-row items-center gap-3">
                  <div
                    className={`flex flex-col w-[42px] h-[42px] rounded-[12px] items-center justify-center bg-gradient-to-br ${section.gradient}`}
                  >
                    <span className="text-[20px]">{section.icon}</span>
                  </div>
                  <span className="font-bold text-[18px] text-[var(--colorText)]">
                    {section.header}
                  </span>
                </div>
                <span className="text-[16px] leading-[26px] text-[var(--colorTextMuted)] whitespace-pre-line">
                  {section.body}
                </span>
              </div>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
