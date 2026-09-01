'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { CASCADE_THEME_IDS, type CascadeTheme } from '../types';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Active theme — controls which themed action-card names are highlighted
   * in the "Themed cards" section. Defaults to `cosmic` so the modal still
   * renders cleanly outside a CascadeThemeProvider (e.g. on the create page
   * before the user picks a theme).
   */
  variant?: CascadeTheme;
}

const THEMED_KINDS = [
  'SKIP',
  'REVERSE',
  'DRAW_TWO',
  'WILD',
  'WILD_DRAW_FOUR',
] as const;

export function RulesModal({
  open,
  onClose,
  variant = 'cyberpunk',
}: RulesModalProps) {
  const { t } = useTranslation();
  const activeVariant: CascadeTheme = (
    CASCADE_THEME_IDS as ReadonlyArray<string>
  ).includes(variant)
    ? variant
    : 'cyberpunk';

  const sections = [
    {
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      header: t('games.cascade_v1.rules.headers.objective'),
      body: t('games.cascade_v1.rules.objective'),
    },
    {
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      header: t('games.cascade_v1.rules.headers.howToPlay'),
      body: t('games.cascade_v1.rules.steps'),
    },
    {
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      header: t('games.cascade_v1.rules.headers.actionCards'),
      body: t('games.cascade_v1.rules.actionCards'),
    },
    {
      icon: '🔁',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      header: t('games.cascade_v1.rules.headers.stacking'),
      body: t('games.cascade_v1.rules.stacking'),
    },
  ];

  // Mechanic shorthand for each action-card kind. Kept inline because the
  // strings are short, untranslatable mechanic labels (the actual themed name
  // is what gets localised). The kind→label map mirrors the symbols from
  // theme.ts so a glance lines up with the in-game glyphs.
  const MECHANIC_LABEL: Record<(typeof THEMED_KINDS)[number], string> = {
    SKIP: 'Skip',
    REVERSE: 'Reverse',
    DRAW_TWO: 'Draw +2',
    WILD: 'Wild',
    WILD_DRAW_FOUR: 'Wild +4',
  };
  const themedRows = THEMED_KINDS.map((kind) => ({
    kind,
    mechanic: MECHANIC_LABEL[kind],
    themed: t(
      `games.cascade_v1.themedCards.${activeVariant}.${kind}` as TranslationKey,
    ),
  }));
  const themeName = t(
    `games.cascade_v1.variants.${activeVariant}.name` as TranslationKey,
  );

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={640} data-testid="cascade-rules-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{t('games.cascade_v1.rules.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col items-stretch gap-3">
            {sections.map((s) => (
              <div
                className="flex flex-col items-stretch p-3 rounded-xl"
                style={{ background: s.gradient }}
                key={s.header}
              >
                <div className="flex flex-row gap-3 items-center pb-2">
                  <span className="text-[22px]" aria-hidden>
                    {s.icon}
                  </span>
                  <span className="text-[#fff] font-bold text-[16px]">
                    {s.header}
                  </span>
                </div>
                <span className="text-[#fff]">{s.body}</span>
              </div>
            ))}

            <div className="flex flex-col items-stretch p-3 rounded-xl bg-[rgba(15,_23,_42,_0.78)] border-[rgba(255,255,255,0.08)] border">
              <div className="flex flex-row gap-3 items-center pb-2">
                <span className="text-[22px]" aria-hidden>
                  🎨
                </span>
                <span className="text-[#fff] font-bold text-[16px]">
                  Themed cards · {themeName}
                </span>
              </div>
              <div className="flex flex-col items-stretch gap-1">
                {themedRows.map((row) => (
                  <div
                    className="flex flex-row gap-2 items-baseline"
                    key={row.kind}
                  >
                    <span className="text-[#fbbf24] font-bold text-[14px]">
                      {row.themed}
                    </span>
                    <span className="text-[#94a3b8] text-[13px]">
                      · {row.mechanic}
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
