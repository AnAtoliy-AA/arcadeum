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
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      header: t('games.checkers_v1.rules.headers.objective'),
      body: t('games.checkers_v1.rules.objective'),
    },
    {
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      header: t('games.checkers_v1.rules.headers.howToPlay'),
      body: t('games.checkers_v1.rules.steps'),
    },
    {
      icon: '👑',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      header: t('games.checkers_v1.rules.headers.kingPromotion'),
      body: t('games.checkers_v1.rules.kingPromotion'),
    },
    {
      icon: '🔄',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      header: t('games.checkers_v1.rules.headers.backwardCaptures'),
      body: t('games.checkers_v1.rules.backwardCaptures'),
    },
    {
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      header: t('games.checkers_v1.rules.headers.forcedCaptures'),
      body: t('games.checkers_v1.rules.forcedCaptures'),
    },
    {
      icon: '🏆',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      header: t('games.checkers_v1.rules.headers.winConditions'),
      body: t('games.checkers_v1.rules.winConditions'),
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={720} data-testid="checkers-rules-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{t('games.checkers_v1.rules.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="box-border flex flex-col items-stretch gap-6">
            {sections.map((section) => (
              <div
                className="box-border flex flex-col items-stretch gap-3"
                key={section.header}
              >
                <div className="box-border flex flex-row items-center gap-3">
                  <div
                    className="box-border flex flex-col w-[42px] h-[42px] rounded-[12px] items-center justify-center"
                    style={{ background: section.gradient }}
                  >
                    <span className="box-border text-[20px]">
                      {section.icon}
                    </span>
                  </div>
                  <span className="box-border font-bold text-[18px] text-[#f1f5f9]">
                    {section.header}
                  </span>
                </div>
                <span className="box-border text-[16px] leading-[26px] text-[#cbd5e1] whitespace-pre-line">
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
