'use client';

import { memo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { GameRulesModal } from '@/features/games/ui/GameRulesModal';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { badge: '🎯', titleKey: 'objectiveTitle', bodyKey: 'objective' },
  { badge: '🎲', titleKey: 'howToPlayTitle', bodyKey: 'howToPlay' },
  { badge: '🗺️', titleKey: 'trackSpacesTitle', bodyKey: 'trackSpaces' },
  { badge: '⚡', titleKey: 'abilitiesTitle', bodyKey: 'abilities' },
  { badge: '🐱', titleKey: 'catsTitle', bodyKey: 'cats' },
  { badge: '🛤️', titleKey: 'trackTypesTitle', bodyKey: 'trackTypes' },
] as const;

export const CatDashRulesModal = memo(function CatDashRulesModal({
  open,
  onClose,
}: RulesModalProps) {
  const { t } = useTranslation();

  const rules = SECTIONS.map((section) => ({
    badge: section.badge,
    title: t(
      `games.cat_dash_v1.rules.${section.titleKey}` as Parameters<typeof t>[0],
    ),
    body: t(
      `games.cat_dash_v1.rules.${section.bodyKey}` as Parameters<typeof t>[0],
    ),
  }));

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.cat_dash_v1.rules.title')}
      icon="🐱"
      rules={rules}
    />
  );
});
