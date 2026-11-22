'use client';

import React from 'react';
import {
  LobbyChoice,
  LobbyOptionGroup,
  LobbyOptionStack,
  LobbySubAdvanced,
  LobbySwitchRow,
} from '@/features/games/ui/LobbyOptionKit';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
    { sonar?: boolean; radar?: boolean; revealAll?: boolean } | undefined;
  const gridLocked = !!ruleComingSoon.get('gridSize');
  const soon = t('games.create.comingSoon');
  const currentMode = (gameOptions.mode as string) ?? 'classic';

  const gridItems = ([10, 15, 20] as const).map((gs) => ({
    id: String(gs),
    label: `${gs}×${gs}`,
    testId: `sea-battle-grid-size-${gs}`,
    disabled: gridLocked,
    badge: gridLocked ? soon : undefined,
  }));
  const modeItems = [
    {
      id: 'classic',
      label: t('games.create.seaBattleModeClassic'),
      description: t('games.create.seaBattleModeClassicDesc'),
    },
    {
      id: 'salvo',
      label: t('games.create.seaBattleModeSalvo'),
      description: t('games.create.seaBattleModeSalvoDesc'),
    },
    {
      id: 'speed',
      label: t('games.create.seaBattleModeSpeed'),
      description: t('games.create.seaBattleModeSpeedDesc'),
    },
  ].map((m) => ({ ...m, testId: `sea-battle-mode-${m.id}` }));
  const shipItems = getShipCountOptions(gridSize).map((count) => ({
    id: String(count),
    label: String(count),
    testId: `sea-battle-ship-count-${count}`,
  }));
  const durationItems = [1, 2, 3, 4, 5].map((sec) => ({
    id: String(sec),
    label: `${sec}s`,
    testId: `sea-battle-reveal-duration-${sec}`,
  }));

  return (
    <LobbyOptionStack data-testid="sea-battle-house-rules">
      <LobbyOptionGroup
        data-testid="sea-battle-grid-size-section"
        title={t('games.create.seaBattleGridSize')}
      >
        <LobbyChoice
          aria-label={t('games.create.seaBattleGridSize')}
          items={gridItems}
          value={String(gridSize)}
          onChange={(id) =>
            onOptionChange({
              gridSize: Number(id),
              shipCount: getDefaultShipCount(Number(id)),
            })
          }
        />
      </LobbyOptionGroup>
      <LobbyOptionGroup title={t('games.create.seaBattleGameMode')}>
        <LobbyChoice
          aria-label={t('games.create.seaBattleGameMode')}
          items={modeItems}
          value={currentMode}
          onChange={(id) => onOptionChange({ mode: id })}
        />
      </LobbyOptionGroup>
      <LobbyOptionGroup title={t('games.create.seaBattleShipCount')}>
        <LobbyChoice
          aria-label={t('games.create.seaBattleShipCount')}
          items={shipItems}
          value={String(shipCount)}
          onChange={(id) => onOptionChange({ shipCount: Number(id) })}
        />
      </LobbyOptionGroup>
      <LobbySubAdvanced
        testId="sea-battle-advanced-rules"
        title={t('games.create.seaBattleAdvancedWeapons')}
      >
        <LobbyOptionGroup title={t('games.create.specialWeapons')}>
          <LobbySwitchRow
            label={t('games.create.seaBattleSonar')}
            hint={t('games.create.seaBattleSonarHint')}
            badge={ruleComingSoon.get('sonar') ? soon : undefined}
            checked={!!sw?.sonar}
            disabled={!!ruleComingSoon.get('sonar')}
            onCheckedChange={(v) =>
              onOptionChange({ specialWeapons: { ...sw, sonar: v } })
            }
          />
          <LobbySwitchRow
            label={t('games.create.seaBattleRadar')}
            hint={t('games.create.seaBattleRadarHint')}
            badge={ruleComingSoon.get('radar') ? soon : undefined}
            checked={!!sw?.radar}
            disabled={!!ruleComingSoon.get('radar')}
            onCheckedChange={(v) =>
              onOptionChange({ specialWeapons: { ...sw, radar: v } })
            }
          />
          <LobbySwitchRow
            label={t('games.create.seaBattleRevealAll')}
            hint={t('games.create.seaBattleRevealAllHint')}
            checked={!!sw?.revealAll}
            onCheckedChange={(v) =>
              onOptionChange({ specialWeapons: { ...sw, revealAll: v } })
            }
          />
          {sw?.revealAll && (
            <LobbyOptionGroup title={t('games.create.seaBattleScanDuration')}>
              <LobbyChoice
                aria-label={t('games.create.seaBattleScanDuration')}
                items={durationItems}
                value={String((gameOptions.revealAllDuration as number) ?? 1)}
                onChange={(id) =>
                  onOptionChange({ revealAllDuration: Number(id) })
                }
              />
            </LobbyOptionGroup>
          )}
        </LobbyOptionGroup>
        <LobbySwitchRow
          label={t('games.create.seaBattleShipAbilities')}
          hint={t('games.create.seaBattleShipAbilitiesHint')}
          checked={!!gameOptions.shipAbilities}
          onCheckedChange={(v) => onOptionChange({ shipAbilities: v })}
        />
      </LobbySubAdvanced>
    </LobbyOptionStack>
  );
}
