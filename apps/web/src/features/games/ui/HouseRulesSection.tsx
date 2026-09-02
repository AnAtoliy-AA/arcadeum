'use client';

import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';

interface HouseRulesSectionProps {
  room: { gameOptions?: Record<string, unknown> };
  ruleComingSoon: Map<string, boolean>;
  onSetOption: (options: Record<string, unknown>) => void;
}

const checkboxStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  accentColor: 'var(--gc-accent, #ffd166)',
};

const labelStyle = (disabled?: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.4 : 1,
});

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

  return (
    <div className="flex flex-col items-stretch gap-3 pt-2">
      <span className="text-[18px] font-semibold">
        {t('games.create.sectionHouseRules') || 'House Rules'}
      </span>

      <label style={labelStyle(!!ruleComingSoon.get('idle'))}>
        <input
          type="checkbox"
          checked={optIdle ?? !!room.gameOptions?.idleTimerAutoplay}
          disabled={!!ruleComingSoon.get('idle')}
          onChange={(e) => {
            const val = e.target.checked;
            setOptIdle(val);
            onSetOption({ idleTimerAutoplay: val });
          }}
          style={checkboxStyle}
        />
        <span className="text-[16px]">
          {t('games.create.rules.idle.title') || 'Idle timer autoplay'}
        </span>
        {ruleComingSoon.get('idle') && (
          <span className="text-[48px] text-[#f59e0b] font-semibold">
            {t('games.create.comingSoon') || 'Coming Soon'}
          </span>
        )}
      </label>

      <label style={labelStyle(!!ruleComingSoon.get('spectators'))}>
        <input
          type="checkbox"
          checked={optSpectators ?? room.gameOptions?.allowSpectators !== false}
          disabled={!!ruleComingSoon.get('spectators')}
          onChange={(e) => {
            const val = e.target.checked;
            setOptSpectators(val);
            onSetOption({ allowSpectators: val });
          }}
          style={checkboxStyle}
        />
        <span className="text-[16px]">
          {t('games.create.rules.spectators.title') || 'Allow spectators'}
        </span>
        {ruleComingSoon.get('spectators') && (
          <span className="text-[48px] text-[#f59e0b] font-semibold">
            {t('games.create.comingSoon') || 'Coming Soon'}
          </span>
        )}
      </label>

      <div className="flex flex-col items-stretch gap-1">
        <span className="text-[16px] font-medium">
          {t('games.create.rules.firstPlayer.title')}
        </span>
        <select
          value={
            optFirstPlayer ??
            (room.gameOptions?.firstPlayer as string) ??
            'host'
          }
          onChange={(e) => {
            const val = e.target.value;
            setOptFirstPlayer(val);
            onSetOption({ firstPlayer: val });
          }}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--glassBorder)',
            background: 'var(--glassBg)',
            color: 'var(--color)',
            fontSize: 14,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <option value="host">
            {t('games.create.rules.firstPlayer.host')}
          </option>
          <option value="random">
            {t('games.create.rules.firstPlayer.random')}
          </option>
        </select>
      </div>
    </div>
  );
}
