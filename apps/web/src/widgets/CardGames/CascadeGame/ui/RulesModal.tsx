'use client';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  GameRulesModal,
  type RuleSection,
} from '@/features/games/ui/GameRulesModal';
import { CASCADE_THEME_IDS, type CascadeTheme } from '../types';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
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

  const MECHANIC_LABEL: Record<(typeof THEMED_KINDS)[number], string> = {
    SKIP: 'Skip',
    REVERSE: 'Reverse',
    DRAW_TWO: 'Draw +2',
    WILD: 'Wild',
    WILD_DRAW_FOUR: 'Wild +4',
  };

  const themedCardsText = THEMED_KINDS.map((kind) => {
    const themed = t(
      `games.cascade_v1.themedCards.${activeVariant}.${kind}` as TranslationKey,
    );
    return `${themed} (${MECHANIC_LABEL[kind]})`;
  }).join(' · ');

  const themeName = t(
    `games.cascade_v1.variants.${activeVariant}.name` as TranslationKey,
  );

  const rules: RuleSection[] = [
    {
      badge: '🎯',
      title: t('games.cascade_v1.rules.headers.objective'),
      body: t('games.cascade_v1.rules.objective'),
    },
    {
      badge: '🎮',
      title: t('games.cascade_v1.rules.headers.howToPlay'),
      body: t('games.cascade_v1.rules.steps'),
    },
    {
      badge: '⚡',
      title: t('games.cascade_v1.rules.headers.actionCards'),
      body: t('games.cascade_v1.rules.actionCards'),
    },
    {
      badge: '🔁',
      title: t('games.cascade_v1.rules.headers.stacking'),
      body: t('games.cascade_v1.rules.stacking'),
    },
    {
      badge: '🎨',
      title: `${t('games.cascade_v1.landing.themes.title')} (${themeName})`,
      body: themedCardsText,
    },
  ];

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.cascade_v1.rules.title')}
      icon="🃏"
      rules={rules}
    />
  );
}
