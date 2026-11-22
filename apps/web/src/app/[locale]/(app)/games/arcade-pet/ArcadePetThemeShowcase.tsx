'use client';

import React, { useState } from 'react';
import { ArcadePetGame } from '@/widgets/SimulationGames/ArcadePetGame';

export interface ThemeOption {
  id: string;
  label: string;
  emoji: string;
}

interface ArcadePetThemeShowcaseProps {
  themes: readonly ThemeOption[];
  pickerLabel: string;
}

/** Theme picker plus live demo; the only client-side part of the landing. */
export function ArcadePetThemeShowcase({
  themes,
  pickerLabel,
}: ArcadePetThemeShowcaseProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(
    themes[0]?.id ?? 'retro',
  );

  return (
    <>
      <div
        role="group"
        aria-label={pickerLabel}
        className="flex flex-wrap items-center justify-center gap-2 pt-2"
      >
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            aria-pressed={selectedTheme === theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
              selectedTheme === theme.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60'
            }`}
          >
            <span aria-hidden="true">{theme.emoji}</span>
            <span>{theme.label}</span>
          </button>
        ))}
      </div>
      <div className="w-full flex justify-center py-4">
        <ArcadePetGame
          gameOptions={{ theme: selectedTheme, mode: 'classic' }}
          currentUserId="guest-player"
          roomId="arcade-pet-preview"
        />
      </div>
    </>
  );
}
