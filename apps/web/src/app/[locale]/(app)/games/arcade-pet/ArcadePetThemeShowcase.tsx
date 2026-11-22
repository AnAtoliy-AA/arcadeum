'use client';

import React, { useState } from 'react';
import { Button } from '@arcadeum/ui';
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
          <Button
            key={theme.id}
            variant="chip"
            size="sm"
            active={selectedTheme === theme.id}
            aria-pressed={selectedTheme === theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className="gap-2 px-4 text-xs font-bold"
          >
            <span aria-hidden="true">{theme.emoji}</span>
            <span>{theme.label}</span>
          </Button>
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
