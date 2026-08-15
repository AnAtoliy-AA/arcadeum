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
  boardSize: number | string;
  winLength: number;
  expansionMargin?: number;
}

const BOARD_VARIANTS: Array<{ size: number | string; win: number }> = [
  { size: 3, win: 3 },
  { size: 5, win: 4 },
  { size: 7, win: 5 },
  { size: 9, win: 5 },
  { size: 'infinity', win: 5 },
];

export function RulesModal({
  open,
  onClose,
  boardSize,
  winLength,
  expansionMargin = 3,
}: RulesModalProps) {
  const { t } = useTranslation();
  const isInfinity = boardSize === 'infinity';

  const sections = [
    {
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      header: t('games.tic_tac_toe_v1.rules.headers.objective'),
      body: isInfinity
        ? t('games.tic_tac_toe_v1.rules.objectiveInfinity', {
            winLength: String(winLength),
            margin: String(expansionMargin),
          })
        : t('games.tic_tac_toe_v1.rules.objective', {
            winLength: String(winLength),
          }),
    },
    {
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      header: t('games.tic_tac_toe_v1.rules.headers.howToPlay'),
      body: t('games.tic_tac_toe_v1.rules.steps'),
    },
  ];

  if (isInfinity) {
    sections.push({
      icon: '✨',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      header: t('games.tic_tac_toe_v1.rules.headers.infinityMode'),
      body: t('games.tic_tac_toe_v1.rules.infinityDescription', {
        margin: String(expansionMargin),
      }),
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={720} data-testid="ttt-rules-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{t('games.tic_tac_toe_v1.rules.title')}</ModalTitle>
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

            <div className="box-border flex flex-col items-stretch gap-3">
              <div className="box-border flex flex-row items-center gap-3">
                <div
                  className="box-border flex flex-col w-[42px] h-[42px] rounded-[12px] items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  }}
                >
                  <span className="box-border text-[20px]">📏</span>
                </div>
                <span className="box-border font-bold text-[18px] text-[#f1f5f9]">
                  {t('games.tic_tac_toe_v1.rules.headers.boardSizes')}
                </span>
              </div>
              <div className="box-border flex flex-row items-stretch flex-wrap gap-3">
                {BOARD_VARIANTS.map((bv) => {
                  const active = bv.size === boardSize;
                  return (
                    <div
                      className="box-border flex flex-col items-stretch border rounded-[14px] p-3 gap-2 basis-[22%] grow min-w-[120px]"
                      style={{
                        backgroundColor: active
                          ? 'rgba(99,102,241,0.18)'
                          : 'rgba(255,255,255,0.03)',
                        borderColor: active
                          ? 'rgba(99,102,241,0.55)'
                          : 'rgba(255,255,255,0.08)',
                      }}
                      key={String(bv.size)}
                    >
                      <span
                        className="box-border font-extrabold text-[20px]"
                        style={{ color: active ? '#c7d2fe' : '#f8fafc' }}
                      >
                        {bv.size === 'infinity' ? '∞' : `${bv.size}×${bv.size}`}
                      </span>
                      <span className="box-border text-[12px] text-[#94a3b8]">
                        {t('games.tic_tac_toe_v1.rules.inARow', {
                          n: String(bv.win),
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <span className="box-border text-[13px] text-[#94a3b8] opacity-[0.85]">
                {t('games.tic_tac_toe_v1.rules.winLengths')}
              </span>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
