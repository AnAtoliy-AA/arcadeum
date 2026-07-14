'use client';

import React from 'react';
import { YStack, Text } from 'tamagui';
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
    <YStack gap="$3" paddingTop="$2">
      <Text fontSize="$4" fontWeight="600">
        {t('games.create.sectionHouseRules') || 'House Rules'}
      </Text>

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
        <Text fontSize="$3">
          {t('games.create.rules.idle.title') || 'Idle timer autoplay'}
        </Text>
        {ruleComingSoon.get('idle') && (
          <Text fontSize={10} color="#f59e0b" fontWeight="600">
            {t('games.create.comingSoon') || 'Coming Soon'}
          </Text>
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
        <Text fontSize="$3">
          {t('games.create.rules.spectators.title') || 'Allow spectators'}
        </Text>
        {ruleComingSoon.get('spectators') && (
          <Text fontSize={10} color="#f59e0b" fontWeight="600">
            {t('games.create.comingSoon') || 'Coming Soon'}
          </Text>
        )}
      </label>

      <YStack gap="$1">
        <Text fontSize="$3" fontWeight="500">
          {t('games.create.rules.firstPlayer.title')}
        </Text>
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
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
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
      </YStack>
    </YStack>
  );
}
