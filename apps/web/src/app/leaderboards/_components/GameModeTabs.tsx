'use client';
import { XStack } from 'tamagui';
import type { KeyboardEvent } from 'react';
import { ModeTab } from '@arcadeum/ui';
import type { GameMode } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const MODES: GameMode[] = ['all', 'mafia', 'werewolf', 'crime', 'horror'];

const GRADIENTS: Record<GameMode, string> = {
  all: 'linear-gradient(135deg,#22d3ee,#a78bfa)',
  mafia: 'linear-gradient(135deg,#f472b6,#fbbf24)',
  werewolf: 'linear-gradient(135deg,#34d399,#22d3ee)',
  crime: 'linear-gradient(135deg,#a78bfa,#f472b6)',
  horror: 'linear-gradient(135deg,#fbbf24,#f97316)',
};

const FALLBACK_ICONS: Record<GameMode, string> = {
  all: '◎',
  mafia: '♤',
  werewolf: '♢',
  crime: '♧',
  horror: '♡',
};

type ModeMeta = { name?: string; subtitle?: string; icon?: string };

export function GameModeTabs({
  value,
  onChange,
  t,
}: {
  value: GameMode;
  onChange: (m: GameMode) => void;
  t?: PageTranslations;
}) {
  const modeLabels = (t?.modes ?? {}) as Record<string, ModeMeta>;

  function handleKey(e: KeyboardEvent<HTMLDivElement>, current: GameMode) {
    const idx = MODES.indexOf(current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = MODES[(idx + 1) % MODES.length];
      if (next) onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = MODES[(idx - 1 + MODES.length) % MODES.length];
      if (prev) onChange(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const first = MODES[0];
      if (first) onChange(first);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = MODES[MODES.length - 1];
      if (last) onChange(last);
    }
  }

  return (
    <XStack gap="$3" flexWrap="wrap" role="tablist">
      {MODES.map((m) => {
        const meta = modeLabels[m] ?? {};
        return (
          <ModeTab
            key={m}
            id={m}
            name={meta.name ?? m}
            subtitle={meta.subtitle}
            icon={meta.icon ?? FALLBACK_ICONS[m]}
            gradient={GRADIENTS[m]}
            active={value === m}
            onSelect={() => onChange(m)}
            onKeyDown={(e) => handleKey(e, m)}
          />
        );
      })}
    </XStack>
  );
}
