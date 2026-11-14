'use client';

import React from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { SELECT_PET_COST, THEME_PET_PALETTES } from '../lib/arcade-pet-economy';

export const SPECIES_OPTIONS: readonly {
  id: PetSpecies;
  label: string;
  emoji: string;
}[] = [
  { id: 'cyber_cat', label: 'Cyber Cat', emoji: '🐱' },
  { id: 'dragon', label: 'Dragon', emoji: '🐲' },
  { id: 'dino', label: 'Dino', emoji: '🦖' },
  { id: 'blob', label: 'Blob', emoji: '🐡' },
  { id: 'slime', label: 'Slime', emoji: '👾' },
];

interface ArcadePetVipSelectionTabProps {
  selectedSpecies: PetSpecies;
  onSelectSpecies: (species: PetSpecies) => void;
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  customName: string;
  onChangeCustomName: (name: string) => void;
  isHomeFull: boolean;
  onAdoptSelected: () => void;
}

export function ArcadePetVipSelectionTab({
  selectedSpecies,
  onSelectSpecies,
  selectedTheme,
  onSelectTheme,
  customName,
  onChangeCustomName,
  isHomeFull,
  onAdoptSelected,
}: ArcadePetVipSelectionTabProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200">
        <strong>VIP Pet Crafting (💎 {SELECT_PET_COST} Gems):</strong> Directly
        choose species and visual theme for your companion.
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-neutral-300 block">
          Choose Species
        </span>
        <div className="grid grid-cols-5 gap-2">
          {SPECIES_OPTIONS.map((spec) => (
            <button
              key={spec.id}
              type="button"
              data-testid={`select-species-${spec.id}`}
              onClick={() => onSelectSpecies(spec.id)}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
                selectedSpecies === spec.id
                  ? 'border-amber-400 bg-amber-500/20 text-white font-bold'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
              }`}
            >
              <span className="text-2xl">{spec.emoji}</span>
              <span className="text-[10px]">{spec.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-neutral-300 block">
          Choose Game Theme
        </span>
        <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
          {Object.values(THEME_PET_PALETTES).map((theme) => (
            <button
              key={theme.id}
              type="button"
              data-testid={`select-theme-${theme.id}`}
              onClick={() => onSelectTheme(theme.id)}
              className={`p-2 rounded-xl text-left border flex items-center gap-1.5 transition-all ${
                selectedTheme === theme.id
                  ? 'border-amber-400 bg-amber-500/20 text-white font-bold'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
              }`}
            >
              <span className="text-base">{theme.emoji}</span>
              <span className="text-[11px] truncate">{theme.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-bold text-neutral-300 block">
          Companion Name
        </span>
        <input
          type="text"
          data-testid="custom-pet-name-input"
          value={customName}
          onChange={(e) => onChangeCustomName(e.target.value)}
          placeholder="e.g. Neon Phantom, Solis, Jade..."
          className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
        />
      </div>

      <button
        type="button"
        data-testid="adopt-selected-btn"
        disabled={isHomeFull}
        onClick={onAdoptSelected}
        className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 ${
          isHomeFull
            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white'
        }`}
      >
        {isHomeFull
          ? '🏠 Upgrade Home to Adopt'
          : `Select & Equip (💎 ${SELECT_PET_COST} Gems)`}
      </button>
    </div>
  );
}
