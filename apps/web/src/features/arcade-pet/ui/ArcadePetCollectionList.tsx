import React from 'react';
import type { PetState } from '@arcadeum/games-core';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';
import { THEME_PET_PALETTES } from '../lib/arcade-pet-economy';

export function ArcadePetCollectionList({
  pets,
  activePetId,
  onSelectPet,
}: {
  pets: PetState[];
  activePetId: string | null;
  onSelectPet: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-300">
          Your Stables ({pets.length} Owned)
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {pets.map((p) => {
          const isActive = p.id === activePetId;
          const palette = THEME_PET_PALETTES[p.theme];
          return (
            <div
              key={p.id}
              data-testid={`pet-item-${p.id}`}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isActive
                  ? 'border-emerald-500/60 bg-emerald-950/30'
                  : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <ArcadePetWalkingSprite
                  species={p.species}
                  state="idle"
                  theme={p.theme}
                  stage={p.stage}
                  className="w-10 h-10"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {p.stage === 'egg' ? 'Mystery Egg' : p.name}
                    {p.stage !== 'egg' && palette && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                        {palette.emoji} {palette.title}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {p.stage === 'egg'
                      ? 'Incubating • Mystery Companion'
                      : `Level ${p.stats.level} • ${p.species} • ${p.stage}`}
                  </span>
                </div>
              </div>

              {isActive ? (
                <span className="text-[11px] font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Active Mount
                </span>
              ) : (
                <button
                  type="button"
                  data-testid={`equip-pet-${p.id}`}
                  onClick={() => onSelectPet(p.id)}
                  className="text-[11px] font-semibold text-white px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
                >
                  Equip
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
