'use client';

import { memo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { GameRulesModal } from '@/features/games/ui/GameRulesModal';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { badge: '🎯', titleKey: 'headers.objective', bodyKey: 'objective' },
  { badge: '🎮', titleKey: 'headers.gameplay', bodyKey: 'gameplay' },
  { badge: '⚓', titleKey: 'headers.placement', bodyKey: 'placement' },
  { badge: '💥', titleKey: 'headers.battle', bodyKey: 'battle' },
  { badge: '🚢', titleKey: 'headers.ships', bodyKey: 'ships' },
] as const;

export const RulesModal = memo(function RulesModal({
  isOpen,
  onClose,
}: RulesModalProps) {
  const { t } = useTranslation();

  const rules = SECTIONS.map((section) => ({
    badge: section.badge,
    title: t(
      `games.sea_battle_v1.rules.${section.titleKey}` as Parameters<typeof t>[0],
    ),
    body: t(
      `games.sea_battle_v1.rules.${section.bodyKey}` as Parameters<typeof t>[0],
    ),
  }));

  return (
    <GameRulesModal
      open={isOpen}
      onClose={onClose}
      title={t('games.sea_battle_v1.rules.title')}
      icon="⚓"
      rules={rules}
    />
  );
});
