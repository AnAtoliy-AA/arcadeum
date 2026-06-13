'use client';

import { YStack, XStack, Text } from 'tamagui';
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
import { CASCADE_VARIANT_IDS, type CascadeVariant } from '../types';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Active theme — controls which themed action-card names are highlighted
   * in the "Themed cards" section. Defaults to `cosmic` so the modal still
   * renders cleanly outside a CascadeThemeProvider (e.g. on the create page
   * before the user picks a theme).
   */
  variant?: CascadeVariant;
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
  variant = 'cosmic',
}: RulesModalProps) {
  const { t } = useTranslation();
  const activeVariant: CascadeVariant = (
    CASCADE_VARIANT_IDS as ReadonlyArray<string>
  ).includes(variant)
    ? variant
    : 'cosmic';

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
          <YStack gap="$3">
            {sections.map((s) => (
              <YStack
                key={s.header}
                padding="$3"
                borderRadius="$3"
                style={{ background: s.gradient }}
              >
                <XStack gap="$3" alignItems="center" paddingBottom="$2">
                  <Text fontSize={22} aria-hidden>
                    {s.icon}
                  </Text>
                  <Text color="#fff" fontWeight="700" fontSize={16}>
                    {s.header}
                  </Text>
                </XStack>
                <Text color="#fff">{s.body}</Text>
              </YStack>
            ))}

            <YStack
              padding="$3"
              borderRadius="$3"
              backgroundColor="rgba(15, 23, 42, 0.78)"
              borderColor="rgba(255,255,255,0.08)"
              borderWidth={1}
            >
              <XStack gap="$3" alignItems="center" paddingBottom="$2">
                <Text fontSize={22} aria-hidden>
                  🎨
                </Text>
                <Text color="#fff" fontWeight="700" fontSize={16}>
                  Themed cards · {themeName}
                </Text>
              </XStack>
              <YStack gap="$1">
                {themedRows.map((row) => (
                  <XStack key={row.kind} gap="$2" alignItems="baseline">
                    <Text color="#fbbf24" fontWeight="700" fontSize={14}>
                      {row.themed}
                    </Text>
                    <Text color="#94a3b8" fontSize={13}>
                      · {row.mechanic}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </YStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
