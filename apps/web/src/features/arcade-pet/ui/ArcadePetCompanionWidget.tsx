'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProgressBar } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { ArcadePetSocialStage } from './ArcadePetSocialStage';

interface ArcadePetCompanionWidgetProps {
  currentUserId?: string;
  theme?: string;
}

export const ArcadePetCompanionWidget: React.FC<
  ArcadePetCompanionWidgetProps
> = ({ currentUserId, theme }) => {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const {
    pet,
    isWidgetOpen,
    initialize,
    performAction,
    toggleWidget,
    setWidgetOpen,
  } = useArcadePetStore();

  useEffect(() => {
    initialize(currentUserId, theme);
  }, [currentUserId, theme, initialize]);

  if (pathname?.includes('/games/arcade-pet')) {
    return null;
  }

  if (!pet) return null;

  const speciesEmoji =
    pet.stage === 'egg'
      ? '🥚'
      : pet.species === 'dragon'
        ? '🐲'
        : pet.species === 'cyber_cat'
          ? '🐱'
          : pet.species === 'dino'
            ? '🦖'
            : pet.species === 'blob'
              ? '🐡'
              : '👾';

  const petGameHref = `/${locale}/games/arcade-pet`;

  return (
    <>
      <ArcadePetSocialStage onOpenCare={() => setWidgetOpen(true)} />

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
        {isWidgetOpen && (
          <div
            data-testid="arcade-pet-companion-modal"
            className="mb-3 w-72 rounded-2xl bg-neutral-900/95 border border-neutral-700/80 p-4 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{speciesEmoji}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight">
                    {pet.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    Level {pet.stats.level} {pet.stage}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleWidget}
                className="text-neutral-400 hover:text-white p-1 text-xs"
                aria-label="Close companion"
              >
                ✕
              </button>
            </div>

            {pet.stage === 'egg' ? (
              <div className="flex flex-col items-center py-2 text-center gap-2">
                <span className="text-xs text-neutral-300">
                  Your ArcadePet is resting in its egg!
                </span>
                <Link
                  href={petGameHref}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase text-center"
                >
                  Hatch in Game Room
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Hunger</span>
                    <span className="font-bold text-neutral-200">
                      {pet.stats.hunger}%
                    </span>
                  </div>
                  <ProgressBar
                    value={pet.stats.hunger}
                    height={6}
                    color="#f59e0b"
                  />

                  <div className="flex justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Happiness</span>
                    <span className="font-bold text-neutral-200">
                      {pet.stats.happiness}%
                    </span>
                  </div>
                  <ProgressBar
                    value={pet.stats.happiness}
                    height={6}
                    color="#f43f5e"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    data-testid="companion-feed-btn"
                    onClick={() => performAction('feed_snack')}
                    className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-center border border-neutral-700 flex items-center justify-center gap-1"
                  >
                    <span>🍰</span> Snack
                  </button>
                  <button
                    type="button"
                    data-testid="companion-praise-btn"
                    onClick={() => performAction('praise')}
                    className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-center border border-neutral-700 flex items-center justify-center gap-1"
                  >
                    <span>❤️</span> Pet
                  </button>
                </div>

                <Link
                  href={petGameHref}
                  className="w-full mt-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase text-center tracking-wide block"
                >
                  Open Game Room →
                </Link>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          data-testid="arcade-pet-companion-trigger"
          onClick={toggleWidget}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-indigo-500/50 shadow-lg backdrop-blur-md text-white transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Toggle ArcadePet Companion"
        >
          <span className="text-lg">{speciesEmoji}</span>
          <span className="text-xs font-bold hidden sm:inline">{pet.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>
    </>
  );
};
