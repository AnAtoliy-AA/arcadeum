'use client';

import React from 'react';
import type { PetMood, PetSpecies, PetStage } from '../types';

interface ArcadePetLcdScreenProps {
  stage: PetStage;
  species: PetSpecies;
  mood: PetMood;
  isSleeping: boolean;
  isSick: boolean;
  poopCount: number;
  activeMenuIndex: number;
  messageText?: string;
}

const MENU_ICONS: readonly { id: string; label: string; icon: string }[] = [
  { id: 'meal', label: 'Meal', icon: '🍖' },
  { id: 'snack', label: 'Snack', icon: '🍰' },
  { id: 'play', label: 'Play', icon: '🎮' },
  { id: 'clean', label: 'Clean', icon: '🛁' },
  { id: 'sleep', label: 'Sleep', icon: '💡' },
  { id: 'heal', label: 'Heal', icon: '💉' },
  { id: 'train', label: 'Train', icon: '🏆' },
  { id: 'treat', label: 'Treat', icon: '🍪' },
];

export const ArcadePetLcdScreen: React.FC<ArcadePetLcdScreenProps> = ({
  stage,
  species,
  mood,
  isSleeping,
  isSick,
  poopCount,
  activeMenuIndex,
  messageText,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-between w-full h-64 p-3 rounded-lg border-4 border-[var(--arcade-shell-border,#1d2a14)] bg-[var(--arcade-screen-bg,#8ea171)] text-[var(--arcade-pixel-color,#1d2a14)] font-mono select-none overflow-hidden shadow-inner">
      <div className="w-full flex items-center justify-between px-1 py-1 border-b border-[var(--arcade-pixel-color,#1d2a14)]/30 text-xs">
        {MENU_ICONS.slice(0, 4).map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
              activeMenuIndex === idx
                ? 'bg-[var(--arcade-pixel-color,#1d2a14)] text-[var(--arcade-screen-bg,#8ea171)] font-bold'
                : 'opacity-70'
            }`}
          >
            <span>{item.icon}</span>
            <span className="hidden sm:inline text-[10px] uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative flex-1 w-full flex flex-col items-center justify-center">
        {isSleeping && (
          <div className="absolute top-2 right-6 animate-pulse text-sm font-bold tracking-widest">
            z Z Z
          </div>
        )}

        {isSick && (
          <div className="absolute top-2 left-6 text-sm animate-bounce">💀</div>
        )}

        {poopCount > 0 && (
          <div className="absolute bottom-2 right-4 flex gap-1 text-sm">
            {Array.from({ length: poopCount }).map((_, i) => (
              <span key={i} className="animate-bounce">
                💩
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-center">
          {stage === 'egg' ? (
            <div className="text-5xl animate-bounce">🥚</div>
          ) : (
            <div className="flex flex-col items-center animate-pulse">
              <div className="text-6xl filter drop-shadow">
                {species === 'dragon' && '🐲'}
                {species === 'cyber_cat' && '🐱'}
                {species === 'dino' && '🦖'}
                {species === 'slime' && '👾'}
                {species === 'blob' && '🐡'}
              </div>
              <div className="text-xs font-bold uppercase mt-1 tracking-wider">
                {mood === 'happy' && '♥ (＾▽＾) ♥'}
                {mood === 'sad' && '(｡•́︿•̀｡)'}
                {mood === 'hungry' && '(⊙_⊙;) Hungry!'}
                {mood === 'sleeping' && '(-_-) zzz'}
                {mood === 'sick' && '(×_×) Sick!'}
                {mood === 'neutral' && '(•‿•)'}
              </div>
            </div>
          )}
        </div>

        {messageText && (
          <div className="absolute bottom-1 bg-[var(--arcade-pixel-color,#1d2a14)] text-[var(--arcade-screen-bg,#8ea171)] text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {messageText}
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between px-1 py-1 border-t border-[var(--arcade-pixel-color,#1d2a14)]/30 text-xs">
        {MENU_ICONS.slice(4, 8).map((item, idx) => {
          const actualIndex = idx + 4;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                activeMenuIndex === actualIndex
                  ? 'bg-[var(--arcade-pixel-color,#1d2a14)] text-[var(--arcade-screen-bg,#8ea171)] font-bold'
                  : 'opacity-70'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline text-[10px] uppercase">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
