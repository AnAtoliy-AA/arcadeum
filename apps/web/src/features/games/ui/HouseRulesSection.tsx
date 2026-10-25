'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface HouseRulesSectionProps {
  room: { gameOptions?: Record<string, unknown> };
  ruleComingSoon: Map<string, boolean>;
  onSetOption: (options: Record<string, unknown>) => void;
}

export function HouseRulesSection({
  room,
  ruleComingSoon,
  onSetOption,
}: HouseRulesSectionProps) {
  const { t } = useTranslation();
  const [optIdle, setOptIdle] = React.useState<boolean | null>(null);
  const [optSpectators, setOptSpectators] = React.useState<boolean | null>(
    null,
  );
  const [optFirstPlayer, setOptFirstPlayer] = React.useState<string | null>(
    null,
  );

  const currentFirstPlayer =
    optFirstPlayer ?? (room.gameOptions?.firstPlayer as string) ?? 'order';
  const isRandomFirst = currentFirstPlayer === 'random';

  const handleFirstPlayerChange = (val: string) => {
    setOptFirstPlayer(val);
    onSetOption({ firstPlayer: val });
  };

  const handleRandomToggle = (checked: boolean) => {
    handleFirstPlayerChange(checked ? 'random' : 'order');
  };

  return (
    <div className="flex flex-col items-stretch gap-3 pt-2">
      <span className="text-[18px] font-semibold text-[var(--textPrimary)]">
        {t('games.create.sectionLobbySettings')}
      </span>

      <label
        className={`flex items-center gap-2 select-none ${
          ruleComingSoon.get('idle')
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer'
        }`}
      >
        <input
          type="checkbox"
          checked={optIdle ?? !!room.gameOptions?.idleTimerAutoplay}
          disabled={!!ruleComingSoon.get('idle')}
          onChange={(e) => {
            const val = e.target.checked;
            setOptIdle(val);
            onSetOption({ idleTimerAutoplay: val });
          }}
          className="w-4 h-4 rounded border border-[var(--glassBorder)] bg-[var(--glassBg)] accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
        />
        <span className="text-[16px] text-[var(--textPrimary)]">
          {t('games.create.rules.idle.title') || 'Idle timer autoplay'}
        </span>
        {ruleComingSoon.get('idle') && (
          <span className="text-xs text-[#f59e0b] font-semibold">
            {t('games.create.comingSoon') || 'Coming Soon'}
          </span>
        )}
      </label>

      <label
        className={`flex items-center gap-2 select-none ${
          ruleComingSoon.get('spectators')
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer'
        }`}
      >
        <input
          type="checkbox"
          checked={optSpectators ?? room.gameOptions?.allowSpectators !== false}
          disabled={!!ruleComingSoon.get('spectators')}
          onChange={(e) => {
            const val = e.target.checked;
            setOptSpectators(val);
            onSetOption({ allowSpectators: val });
          }}
          className="w-4 h-4 rounded border border-[var(--glassBorder)] bg-[var(--glassBg)] accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
        />
        <span className="text-[16px] text-[var(--textPrimary)]">
          {t('games.create.rules.spectators.title') || 'Allow spectators'}
        </span>
        {ruleComingSoon.get('spectators') && (
          <span className="text-xs text-[#f59e0b] font-semibold">
            {t('games.create.comingSoon') || 'Coming Soon'}
          </span>
        )}
      </label>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          data-testid="random-first-player-checkbox"
          checked={isRandomFirst}
          onChange={(e) => handleRandomToggle(e.target.checked)}
          className="w-4 h-4 rounded border border-[var(--glassBorder)] bg-[var(--glassBg)] accent-blue-600 cursor-pointer"
        />
        <span className="text-[16px] text-[var(--textPrimary)]">
          {t('games.create.rules.firstPlayer.random')}
        </span>
      </label>

      <div className="flex flex-col items-stretch gap-1 max-w-[220px]">
        <span className="text-sm font-medium text-[var(--textSecondary)]">
          {t('games.create.rules.firstPlayer.title')}
        </span>
        <select
          aria-label={t('games.create.rules.firstPlayer.title')}
          data-testid="first-player-select"
          value={isRandomFirst ? 'random' : 'host'}
          onChange={(e) => handleFirstPlayerChange(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] text-sm cursor-pointer w-full focus:outline-none focus:border-[var(--primary)]"
        >
          <option
            value="host"
            className="bg-[var(--surface)] text-[var(--color)]"
          >
            {t('games.create.rules.firstPlayer.host')}
          </option>
          <option
            value="random"
            className="bg-[var(--surface)] text-[var(--color)]"
          >
            {t('games.create.rules.firstPlayer.random')}
          </option>
        </select>
      </div>
    </div>
  );
}
