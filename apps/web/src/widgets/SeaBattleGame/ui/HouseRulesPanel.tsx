'use client';

import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { getDefaultShipCount } from '../types';

function getShipCountOptions(gridSize: number): number[] {
  if (gridSize <= 10) return [6, 8, 10, 12, 14];
  if (gridSize <= 15) return [10, 12, 14, 16, 18, 20];
  return [14, 16, 18, 20, 22, 24, 26];
}

interface HouseRulesPanelProps {
  gameOptions: Record<string, unknown>;
  ruleComingSoon: Map<string, boolean>;
  onOptionChange: (options: Record<string, unknown>) => void;
}

export function HouseRulesPanel({
  gameOptions,
  ruleComingSoon,
  onOptionChange,
}: HouseRulesPanelProps) {
  const { t } = useTranslation();
  const gridSize = (gameOptions.gridSize as number) ?? 10;
  const shipCount =
    (gameOptions.shipCount as number) ?? getDefaultShipCount(gridSize);
  const sw = gameOptions.specialWeapons as
    | { sonar?: boolean; radar?: boolean }
    | undefined;

  return (
    <YStack gap="$3" paddingVertical="$2">
      <Text fontSize="$4" fontWeight="600">
        {t('games.create.sectionHouseRules') || 'House Rules'}
      </Text>
      <YStack gap="$2">
        <Text fontSize="$3" fontWeight="600">
          {t('games.create.seaBattleGridSize') || 'Grid Size'}
          {ruleComingSoon.get('gridSize') && (
            <Text fontSize={10} color="#f59e0b" fontWeight="600" marginLeft={8}>
              {t('games.create.comingSoon') || 'Coming Soon'}
            </Text>
          )}
        </Text>
        <XStack gap="$2" flexWrap="wrap">
          {([10, 15, 20] as const).map((gs) => {
            const disabled = !!ruleComingSoon.get('gridSize');
            const active = gridSize === gs;
            return (
              <Button
                key={gs}
                variant="chip"
                size="sm"
                disabled={disabled}
                data-active={active}
                backgroundColor={
                  active ? 'rgba(59,130,246,0.15)' : 'transparent'
                }
                borderColor={
                  active ? 'var(--color, #3b82f6)' : 'rgba(255,255,255,0.2)'
                }
                color={
                  disabled
                    ? '#52525b'
                    : active
                      ? 'var(--color, #3b82f6)'
                      : '#e2e8f0'
                }
                hoverStyle={{
                  backgroundColor: active
                    ? 'rgba(59,130,246,0.2)'
                    : 'rgba(255,255,255,0.05)',
                }}
                borderRadius={8}
                fontWeight={600}
                fontSize={13}
                opacity={disabled ? 0.4 : 1}
                onClick={() => {
                  if (disabled) return;
                  onOptionChange({
                    gridSize: gs,
                    shipCount: getDefaultShipCount(gs),
                  });
                }}
              >
                {gs}×{gs}
              </Button>
            );
          })}
        </XStack>
      </YStack>
      <YStack gap="$2">
        <Text fontSize="$3" fontWeight="600">
          {t('games.create.seaBattleShipCount') || 'Number of Ships'}
        </Text>
        <XStack gap="$2" flexWrap="wrap">
          {getShipCountOptions(gridSize).map((count) => {
            const active = shipCount === count;
            return (
              <Button
                key={count}
                variant="chip"
                size="sm"
                data-active={active}
                backgroundColor={
                  active ? 'rgba(59,130,246,0.15)' : 'transparent'
                }
                borderColor={
                  active ? 'var(--color, #3b82f6)' : 'rgba(255,255,255,0.2)'
                }
                color={active ? 'var(--color, #3b82f6)' : '#e2e8f0'}
                hoverStyle={{
                  backgroundColor: active
                    ? 'rgba(59,130,246,0.2)'
                    : 'rgba(255,255,255,0.05)',
                }}
                borderRadius={8}
                fontWeight={600}
                fontSize={13}
                onClick={() => onOptionChange({ shipCount: count })}
              >
                {count}
              </Button>
            );
          })}
        </XStack>
      </YStack>
      <YStack gap="$2">
        <Text fontSize="$3" fontWeight="600">
          {t('games.create.specialWeapons') || 'Special Weapons'}
          {(ruleComingSoon.get('sonar') || ruleComingSoon.get('radar')) && (
            <Text fontSize={10} color="#f59e0b" fontWeight="600" marginLeft={8}>
              {t('games.create.comingSoon') || 'Coming Soon'}
            </Text>
          )}
        </Text>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            opacity: ruleComingSoon.get('sonar') ? 0.4 : 1,
            cursor: ruleComingSoon.get('sonar') ? 'not-allowed' : 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={!!sw?.sonar}
            disabled={!!ruleComingSoon.get('sonar')}
            onChange={() =>
              onOptionChange({
                specialWeapons: { ...sw, sonar: !sw?.sonar },
              })
            }
          />
          {t('games.create.seaBattleSonar') || 'Sonar'} —{' '}
          {t('games.create.seaBattleSonarHint') || 'Reveal ship locations'}
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            opacity: ruleComingSoon.get('radar') ? 0.4 : 1,
            cursor: ruleComingSoon.get('radar') ? 'not-allowed' : 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={!!sw?.radar}
            disabled={!!ruleComingSoon.get('radar')}
            onChange={() =>
              onOptionChange({
                specialWeapons: { ...sw, radar: !sw?.radar },
              })
            }
          />
          {t('games.create.seaBattleRadar') || 'Radar'} —{' '}
          {t('games.create.seaBattleRadarHint') || 'Scan a row or column'}
        </label>
      </YStack>
    </YStack>
  );
}
