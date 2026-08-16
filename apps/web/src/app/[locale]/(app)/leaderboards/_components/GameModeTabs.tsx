'use client';
import type { KeyboardEvent } from 'react';
import { ModeTab } from '@arcadeum/ui';
import type { GameMode } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const GRADIENTS: Record<GameMode, string> = {
  all: 'linear-gradient(135deg,#22d3ee,#a78bfa)',
  critical_v1: 'linear-gradient(135deg,#f472b6,#fbbf24)',
  sea_battle_v1: 'linear-gradient(135deg,#22d3ee,#0ea5e9)',
  texas_holdem_v1: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
  glimworm_v1: 'linear-gradient(135deg,#34d399,#22d3ee)',
  tic_tac_toe_v1: 'linear-gradient(135deg,#a78bfa,#ec4899)',
  cascade_v1: 'linear-gradient(135deg,#38bdf8,#818cf8)',
  chess_v1: 'linear-gradient(135deg,#94a3b8,#e2e8f0)',
  checkers_v1: 'linear-gradient(135deg,#f97316,#facc15)',
  cat_dash_v1: 'linear-gradient(135deg,#fb923c,#ec4899)',
};

const FALLBACK_ICONS: Record<GameMode, string> = {
  all: '◎',
  critical_v1: '♠',
  sea_battle_v1: '⚓',
  texas_holdem_v1: '♠',
  glimworm_v1: '🐍',
  tic_tac_toe_v1: '✕',
  cascade_v1: '▥',
  chess_v1: '♞',
  checkers_v1: '●',
  cat_dash_v1: '🐱',
};

type ModeMeta = { name?: string; subtitle?: string; icon?: string };

export function GameModeTabs({
  modes,
  value,
  onChange,
  t,
}: {
  /** Server-provided list of available modes (from the game catalog). */
  modes: GameMode[];
  value: GameMode;
  onChange: (m: GameMode) => void;
  t?: PageTranslations;
}) {
  const modeLabels = (t?.modes ?? {}) as Record<string, ModeMeta>;

  // Fall back to the active mode so a mode removed server-side doesn't
  // leave the tab strip empty while the snapshot is loading.
  const tabs = modes.length > 0 ? modes : [value];

  function handleKey(e: KeyboardEvent<HTMLDivElement>, current: GameMode) {
    const idx = tabs.indexOf(current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = tabs[(idx + 1) % tabs.length];
      if (next) onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      if (prev) onChange(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      const first = tabs[0];
      if (first) onChange(first);
    } else if (e.key === 'End') {
      e.preventDefault();
      const last = tabs[tabs.length - 1];
      if (last) onChange(last);
    }
  }

  return (
    <div className="flex flex-row items-stretch gap-3 flex-wrap" role="tablist">
      {tabs.map((m) => {
        const meta = modeLabels[m] ?? {};
        return (
          <ModeTab
            key={m}
            id={m}
            name={meta.name ?? m}
            subtitle={meta.subtitle}
            icon={meta.icon ?? FALLBACK_ICONS[m] ?? '🎮'}
            gradient={GRADIENTS[m] ?? 'linear-gradient(135deg,#64748b,#22d3ee)'}
            active={value === m}
            onSelect={() => onChange(m)}
            onKeyDown={(e) => handleKey(e, m)}
          />
        );
      })}
    </div>
  );
}
