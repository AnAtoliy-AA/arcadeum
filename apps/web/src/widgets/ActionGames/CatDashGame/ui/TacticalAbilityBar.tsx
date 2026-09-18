'use client';

import { memo } from 'react';
import type { CatId } from '../types';
import { RACER_TACTICAL_ABILITIES } from './catData';

interface TacticalAbilityBarProps {
  catId: CatId;
  powerTokens: number;
  abilitiesUsed?: string[];
  speedBoostPending?: number;
  shielded?: boolean;
  myTurn: boolean;
  isGameOver: boolean;
  isRolling: boolean;
  onUseAbility: (abilityId: string) => void;
}

export const TacticalAbilityBar = memo(function TacticalAbilityBar({
  catId,
  powerTokens,
  abilitiesUsed = [],
  speedBoostPending = 0,
  shielded = false,
  myTurn,
  isGameOver,
  isRolling,
  onUseAbility,
}: TacticalAbilityBarProps) {
  const abilities = RACER_TACTICAL_ABILITIES[catId] ?? [];

  return (
    <div
      className="flex flex-col gap-2 p-3.5 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-xl"
      data-testid="tactical-ability-bar"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">⚡</span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            Tactical Abilities
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`text-sm transition-transform ${
                i < powerTokens ? 'text-amber-400 scale-100' : 'text-white/10 scale-90'
              }`}
            >
              ⚡
            </span>
          ))}
          <span className="text-xs font-black text-slate-300 ml-1">
            {powerTokens}/3
          </span>
        </div>
      </div>

      {(shielded || speedBoostPending > 0) && (
        <div className="flex flex-wrap gap-2">
          {shielded && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-extrabold animate-pulse"
              data-testid="buff-shield"
            >
              <span>🛡️</span>
              <span>Shield Active</span>
            </div>
          )}
          {speedBoostPending > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-extrabold animate-pulse"
              data-testid="buff-speed-boost"
            >
              <span>🚀</span>
              <span>
                {speedBoostPending === 999 ? 'Apex Precision (4)' : '+3 Speed Primed'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {abilities.map((ability, idx) => {
          const isUsed =
            abilitiesUsed.includes(ability.id) ||
            abilitiesUsed.includes(`ability_${idx + 1}`);
          const canAfford = powerTokens >= ability.cost;
          const canActivate =
            myTurn && !isGameOver && !isRolling && !isUsed && canAfford;

          return (
            <button
              key={ability.id}
              type="button"
              disabled={!canActivate}
              onClick={() => onUseAbility(ability.id)}
              className={`flex flex-col items-start gap-1 p-2.5 rounded-2xl border text-left transition-all ${
                isUsed
                  ? 'bg-slate-950/30 border-white/5 opacity-40 cursor-not-allowed'
                  : canActivate
                    ? 'bg-purple-950/30 hover:bg-purple-900/40 border-purple-500/50 hover:border-purple-400 text-white shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 cursor-pointer active:scale-[0.98]'
                    : 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed'
              }`}
              data-testid={`ability-btn-${ability.id}`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{ability.icon}</span>
                  <span className="text-xs font-black text-slate-100 truncate">
                    {ability.name}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-black border ${
                    isUsed
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : canActivate
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {isUsed ? 'Used' : `${ability.cost} ⚡`}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight">
                {ability.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
