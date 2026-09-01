'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@arcadeum/ui';
import { type TranslationKey } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function RulesModal({ isOpen, onClose, t }: RulesModalProps) {
  const shipsRaw = t('games.sea_battle_v1.rules.ships');
  const ships = shipsRaw
    .split('\n')
    .map((line) => {
      const match = line.match(/•\s+(.+)\s+\((\d+)\s+.*\)\s+-\s+(.+)/);
      if (match)
        return { name: match[1], size: match[2], description: match[3] };
      return null;
    })
    .filter(Boolean);

  const sections = [
    {
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
      header: t(
        'games.sea_battle_v1.rules.headers.objective' as TranslationKey,
      ),
      text: t('games.sea_battle_v1.rules.objective' as TranslationKey),
    },
    {
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      header: t('games.sea_battle_v1.rules.headers.gameplay' as TranslationKey),
      text: t('games.sea_battle_v1.rules.gameplay' as TranslationKey),
    },
    {
      icon: '⚓',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      header: t(
        'games.sea_battle_v1.rules.headers.placement' as TranslationKey,
      ),
      text: t('games.sea_battle_v1.rules.placement' as TranslationKey),
    },
    {
      icon: '💥',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      header: t('games.sea_battle_v1.rules.headers.battle' as TranslationKey),
      text: t('games.sea_battle_v1.rules.battle' as TranslationKey),
    },
  ];

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent maxWidth={850} data-testid="rules-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>
            {t('games.sea_battle_v1.rules.title' as TranslationKey)}
          </ModalTitle>
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
                    className="flex flex-col w-[42px] h-[42px] rounded-[12px] items-center justify-center"
                    style={{ background: section.gradient }}
                  >
                    <span className="text-[20px]">{section.icon}</span>
                  </div>
                  <span className="font-bold text-[18px] text-[var(--color)]">
                    {section.header}
                  </span>
                </div>
                <span className="text-[16px] leading-[26px] text-[var(--textSecondary)]">
                  {section.text}
                </span>
              </div>
            ))}

            <div className="flex flex-col items-stretch gap-3">
              <div className="flex flex-row items-center gap-3">
                <div
                  className="flex flex-col w-[42px] h-[42px] rounded-[12px] items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  }}
                >
                  <span className="text-[20px]">🚢</span>
                </div>
                <span className="font-bold text-[18px] text-[var(--color)]">
                  {t(
                    'games.sea_battle_v1.rules.headers.ships' as TranslationKey,
                  )}
                </span>
              </div>
              <div className="flex flex-row items-stretch flex-wrap gap-3">
                {ships.map((ship, idx) => (
                  <div
                    className="flex flex-col items-stretch bg-[var(--backgroundHover)] border border-[var(--glassBorder)] rounded-[16px] p-3 gap-2 basis-[45%] grow"
                    key={idx}
                  >
                    <div className="flex flex-row justify-between items-center">
                      <span className="font-bold text-[var(--color)]">
                        {ship?.name}
                      </span>
                      <div className="flex flex-row items-stretch bg-[rgba(56,189,248,0.1)] px-2 py-2 rounded-[8px]">
                        <span className="text-[#38bdf8] text-[11px] font-bold uppercase">
                          {ship?.size}{' '}
                          {t(
                            'games.sea_battle_v1.table.state.cells' as TranslationKey,
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="text-[14px] text-[var(--textSecondary)] leading-[20px]">
                      {ship?.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
