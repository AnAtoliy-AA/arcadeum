'use client';

import { useState, useMemo } from 'react';
import type { SeaBattlePlayerState } from '../types';

interface ShipAbilitiesPanelProps {
  player: SeaBattlePlayerState;
  cooldowns?: Record<string, number>;
  onUseAbility?: (
    abilityId: string,
    targetPlayerId?: string,
    row?: number,
    col?: number,
  ) => void;
}

const ALL_ABILITIES = [
  {
    id: 'scout',
    name: 'Scout',
    description: 'Reveal 3×3 area',
    cooldown: 3,
    shipTypes: ['Carrier'],
    icon: '🔍',
    color: 'text-cyan-400',
  },
  {
    id: 'barrage',
    name: 'Barrage',
    description: 'Fire 3 extra shots',
    cooldown: 4,
    shipTypes: ['Battleship'],
    icon: '💥',
    color: 'text-orange-400',
  },
  {
    id: 'sonar_ping',
    name: 'Sonar Ping',
    description: 'Detect nearby ships',
    cooldown: 2,
    shipTypes: ['Cruiser', 'Frigate'],
    icon: '📡',
    color: 'text-blue-400',
  },
  {
    id: 'torpedo',
    name: 'Torpedo',
    description: 'Guaranteed hit',
    cooldown: 5,
    shipTypes: ['Destroyer'],
    icon: '🎯',
    color: 'text-red-400',
  },
  {
    id: 'silent_run',
    name: 'Silent Run',
    description: 'Immune to sonar',
    cooldown: 3,
    shipTypes: ['Submarine'],
    icon: '🤫',
    color: 'text-purple-400',
  },
  {
    id: 'patrol_scout',
    name: 'Scout',
    description: 'Reveal 1 cell',
    cooldown: 1,
    shipTypes: ['Patrol'],
    icon: '🔭',
    color: 'text-green-400',
  },
];

export function ShipAbilitiesPanel({
  player,
  cooldowns,
  onUseAbility,
}: ShipAbilitiesPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const availableAbilities = useMemo(() => {
    const abilities: Array<
      (typeof ALL_ABILITIES)[number] & { currentCooldown: number }
    > = [];
    const seen = new Set<string>();

    for (const ship of player.ships) {
      if (ship.sunk) continue;
      for (const ab of ALL_ABILITIES) {
        if (ab.shipTypes.includes(ship.name) && !seen.has(ab.id)) {
          seen.add(ab.id);
          abilities.push({ ...ab, currentCooldown: cooldowns?.[ab.id] ?? 0 });
        }
      }
    }
    return abilities;
  }, [player.ships, cooldowns]);

  if (availableAbilities.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        {expanded ? '▼' : '▶'} Ship Abilities ({availableAbilities.length})
      </button>
      {expanded && (
        <div className="flex gap-1.5 flex-wrap justify-center">
          {availableAbilities.map((ab) => {
            const onCooldown = ab.currentCooldown > 0;
            return (
              <button
                key={ab.id}
                type="button"
                disabled={onCooldown}
                onClick={() => onUseAbility?.(ab.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  onCooldown
                    ? 'opacity-40 cursor-not-allowed bg-neutral-800 text-neutral-500 border border-neutral-700'
                    : `cursor-pointer bg-neutral-800/50 border border-neutral-600 hover:border-neutral-400 ${ab.color}`
                }`}
                title={ab.description}
              >
                <span>{ab.icon}</span>
                <span>{ab.name}</span>
                {onCooldown && (
                  <span className="text-[10px] text-neutral-500">
                    ({ab.currentCooldown}t)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
