'use client';

import React from 'react';
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
    { sonar?: boolean; radar?: boolean; revealAll?: boolean } | undefined;

  return (
    <div className="flex flex-col items-stretch gap-3 py-2">
      <span className="text-[18px] font-semibold">
        {t('games.create.sectionHouseRules') || 'House Rules'}
      </span>
      <div className="flex flex-col items-stretch gap-2">
        <span className="text-[16px] font-semibold">
          {t('games.create.seaBattleGridSize') || 'Grid Size'}
          {ruleComingSoon.get('gridSize') && (
            <span className="text-[48px] text-[#f59e0b] font-semibold -ml-8">
              {t('games.create.comingSoon') || 'Coming Soon'}
            </span>
          )}
        </span>
        <div className="flex flex-row items-stretch gap-2 flex-wrap">
          {([10, 15, 20] as const).map((gs) => {
            const disabled = !!ruleComingSoon.get('gridSize');
            const active = gridSize === gs;
            return (
              <Button
                className={`rounded-[8px] font-semibold text-[13px] ${
                  active
                    ? 'bg-blue-500/20 border-blue-500/60 text-blue-500 hover:bg-blue-500/25'
                    : 'bg-[var(--glassBg)] border-[var(--glassBorder)] text-[var(--color)] hover:bg-[var(--glassBgHover)]'
                } ${disabled ? 'opacity-40' : 'opacity-100'}`}
                key={gs}
                variant="chip"
                size="sm"
                disabled={disabled}
                data-active={active ? 'on' : undefined}
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
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-2">
        <span className="text-[16px] font-semibold">
          {t('games.create.seaBattleShipCount') || 'Number of Ships'}
        </span>
        <div className="flex flex-row items-stretch gap-2 flex-wrap">
          {getShipCountOptions(gridSize).map((count) => {
            const active = shipCount === count;
            return (
              <Button
                className={`rounded-[8px] font-semibold text-[13px] ${
                  active
                    ? 'bg-blue-500/20 border-blue-500/60 text-blue-500 hover:bg-blue-500/25'
                    : 'bg-[var(--glassBg)] border-[var(--glassBorder)] text-[var(--color)] hover:bg-[var(--glassBgHover)]'
                }`}
                key={count}
                variant="chip"
                size="sm"
                data-active={active ? 'on' : undefined}
                onClick={() => onOptionChange({ shipCount: count })}
              >
                {count}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-2">
        <span className="text-[16px] font-semibold">
          {t('games.create.specialWeapons') || 'Special Weapons'}
          {(ruleComingSoon.get('sonar') || ruleComingSoon.get('radar')) && (
            <span className="text-[48px] text-[#f59e0b] font-semibold -ml-8">
              {t('games.create.comingSoon') || 'Coming Soon'}
            </span>
          )}
        </span>
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

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={!!sw?.revealAll}
            onChange={() =>
              onOptionChange({
                specialWeapons: { ...sw, revealAll: !sw?.revealAll },
              })
            }
          />
          {t('games.create.seaBattleRevealAll') || 'Scan Wave'} —{' '}
          {t('games.create.seaBattleRevealAllHint') ||
            'Reveal all ships briefly at battle start'}
        </label>

        {sw?.revealAll && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              paddingLeft: 24,
            }}
          >
            <span className="text-[12px] opacity-[0.6]">Duration:</span>
            {[1, 2, 3, 4, 5].map((sec) => {
              const currentDuration =
                (gameOptions.revealAllDuration as number) ?? 1;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onOptionChange({ revealAllDuration: sec })}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor:
                      currentDuration === sec
                        ? '#f59e0b'
                        : 'rgba(255,255,255,0.2)',
                    background:
                      currentDuration === sec
                        ? 'rgba(251,191,36,0.2)'
                        : 'transparent',
                    color: currentDuration === sec ? '#f59e0b' : '#999',
                  }}
                >
                  {sec}s
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
