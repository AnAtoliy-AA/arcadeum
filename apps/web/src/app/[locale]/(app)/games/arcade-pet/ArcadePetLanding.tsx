'use client';

import React, { useState } from 'react';
import { ArcadePetGame } from '@/widgets/SimulationGames/ArcadePetGame';

interface ArcadePetLandingProps {
  gameName: string;
  description: string;
  comingSoon?: boolean;
}

const THEME_OPTIONS: readonly { id: string; label: string; emoji: string }[] = [
  { id: 'retro', label: 'Classic LCD', emoji: '🕹️' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '⚡' },
  { id: 'zen', label: 'Zen Garden', emoji: '🎋' },
  { id: 'underwater', label: 'Ocean Teal', emoji: '🌊' },
];

export const ArcadePetLanding: React.FC<ArcadePetLandingProps> = ({
  gameName,
  description,
  comingSoon = false,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('retro');

  return (
    <div className="flex flex-col items-center gap-12 w-full py-8 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center max-w-3xl gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest">
          <span>✨</span> Virtual Companion Simulation
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          {gameName}
        </h1>
        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
          {description}
        </p>

        {!comingSoon && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTheme === theme.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60'
                }`}
              >
                <span>{theme.emoji}</span>
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full flex justify-center py-4">
        {comingSoon ? (
          <div
            data-testid="arcade-pet-coming-soon-banner"
            className="w-full max-w-xl p-8 rounded-2xl bg-neutral-900/90 border border-amber-500/40 text-center flex flex-col items-center gap-3 shadow-xl backdrop-blur-md"
          >
            <div className="text-4xl">🔒</div>
            <h2 className="text-xl font-bold text-amber-300">
              Feature Currently Disabled
            </h2>
            <p className="text-sm text-neutral-300">
              ArcadePet simulation is temporarily disabled by administrators.
              Check back soon!
            </p>
          </div>
        ) : (
          <ArcadePetGame
            gameOptions={{ theme: selectedTheme, mode: 'classic' }}
            currentUserId="guest-player"
            roomId="arcade-pet-preview"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
          <div className="text-3xl">🥚</div>
          <h2 className="text-lg font-bold text-white">Hatch & Nurture</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Choose your species and watch your pet hatch from an egg. Give it
            regular meals, wash away messes, and tuck it in when tired.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
          <div className="text-3xl">🍪</div>
          <h2 className="text-lg font-bold text-white">Cross-Game Treats</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Win games in Chess, Sea Battle, Hearts, and Pachisi across Arcadeum
            to unlock exclusive snack cookies and evolution bonuses.
          </p>
        </div>

        <div className="flex flex-col gap-2 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
          <div className="text-3xl">🐲</div>
          <h2 className="text-lg font-bold text-white">Branching Evolutions</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your care discipline shapes your companion. From tiny slime to
            mighty cyber dragon, discover unique life stages and secret forms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArcadePetLanding;
