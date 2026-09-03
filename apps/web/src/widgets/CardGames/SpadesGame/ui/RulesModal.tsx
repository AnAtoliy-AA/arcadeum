'use client';

import { memo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { GameRulesModal } from '@/features/games/ui/GameRulesModal';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  variant?: string;
}

const SECTIONS = [
  { badge: '🎯', titleKey: 'objectiveTitle', bodyKey: 'objective' },
  { badge: '🃏', titleKey: 'setupTitle', bodyKey: 'setup' },
  { badge: '♠️', titleKey: 'biddingTitle', bodyKey: 'bidding' },
  { badge: '🎮', titleKey: 'gameplayTitle', bodyKey: 'gameplay' },
  { badge: '🏆', titleKey: 'scoringTitle', bodyKey: 'scoring' },
] as const;

export const RulesModal = memo(function RulesModal({
  open,
  onClose,
  variant,
}: RulesModalProps) {
  const { t } = useTranslation();

  const rules = SECTIONS.map((section) => ({
    badge: section.badge,
    title: t(
      `games.spades_v1.rules.${section.titleKey}` as Parameters<typeof t>[0],
    ),
    body: t(
      `games.spades_v1.rules.${section.bodyKey}` as Parameters<typeof t>[0],
    ),
  }));

  return (
    <GameRulesModal
      open={open}
      onClose={onClose}
      title={t('games.spades_v1.rules.title')}
      icon="♠"
      variant={variant}
      rules={rules}
    />
  );
});
