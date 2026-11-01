'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProgressBar } from '@arcadeum/ui';
import { getGrowthSpeedPercent } from '@arcadeum/games-core';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { ArcadePetSocialStage } from './ArcadePetSocialStage';
import { ArcadePetAdoptionModal } from './ArcadePetAdoptionModal';
import { ArcadePetGiftsModal } from './ArcadePetGiftsModal';
import { ArcadePetCommitmentModal } from './ArcadePetCommitmentModal';
import { THEME_PET_PALETTES, getPetFoodCost } from '../lib/arcade-pet-economy';
import { gamesApi } from '@/features/games/api';
import { isPetFeatureDisabled } from '../lib/arcade-pet-feature-flag';

interface ArcadePetCompanionWidgetProps {
  currentUserId?: string;
  theme?: string;
}

export const ArcadePetCompanionWidget: React.FC<
  ArcadePetCompanionWidgetProps
> = ({ currentUserId, theme }) => {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const { snapshot } = useSessionTokens();
  const isAuthenticated = Boolean(snapshot.accessToken || currentUserId);

  const {
    pet,
    pets,
    gemBalance,
    coinBalance,
    actionError,
    presents,
    isWidgetOpen,
    isAtHome,
    initialize,
    performAction,
    toggleWidget,
    setWidgetOpen,
    toggleHome,
    adoptRandomPet,
    selectActivePet,
    homeCapacity,
  } = useArcadePetStore();

  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [showGiftsModal, setShowGiftsModal] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [isFeatureDisabled, setIsFeatureDisabled] = useState(false);

  useEffect(() => {
    initialize(currentUserId, theme);
  }, [currentUserId, theme, initialize]);

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog({ token: snapshot.accessToken || undefined })
      .then((res) => {
        if (cancelled) return;
        setIsFeatureDisabled(isPetFeatureDisabled(res.games));
      })
      .catch(() => {
        // Fallback on network error: keep available
      });
    return () => {
      cancelled = true;
    };
  }, [snapshot.accessToken]);

  if (pathname?.includes('/games/arcade-pet') || isFeatureDisabled) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
        {showRegisterPrompt && (
          <div
            data-testid="arcade-pet-register-prompt"
            className="mb-3 w-72 rounded-2xl bg-neutral-900/95 border border-amber-500/50 p-4 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-2.5 text-center"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <span>🔒</span>
                <span>Registration Required</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterPrompt(false)}
                className="text-neutral-400 hover:text-white p-1 text-xs"
                aria-label="Close prompt"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Only registered players can adopt ArcadePets! Register or log in
              to unlock your free pet companion.
            </p>
            <Link
              href={`/${locale}/auth`}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs uppercase text-center shadow-md transition-transform transform hover:scale-105"
            >
              Register / Log In →
            </Link>
          </div>
        )}

        <button
          type="button"
          aria-disabled="true"
          data-testid="arcade-pet-companion-trigger"
          onClick={() => setShowRegisterPrompt((prev) => !prev)}
          title="Only registered players can have pets. Register to adopt!"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 shadow-lg backdrop-blur-md text-neutral-400 opacity-80 cursor-pointer hover:border-amber-500/60 transition-all"
          aria-label="Register to adopt pet"
        >
          <span className="text-lg">🔒</span>
          <span className="text-xs font-bold">Register for Pet</span>
        </button>
      </div>
    );
  }

  if (!pet) {
    return (
      <>
        <ArcadePetCommitmentModal
          open={showCommitmentModal}
          onClose={() => setShowCommitmentModal(false)}
          onConfirm={() => adoptRandomPet()}
        />

        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
          <button
            type="button"
            data-testid="arcade-pet-companion-trigger"
            onClick={() => setShowCommitmentModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/50 shadow-lg backdrop-blur-md text-white transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Adopt Free Pet"
          >
            <span className="text-lg">🥚</span>
            <span className="text-xs font-bold">Adopt Free Pet 🐾</span>
          </button>
        </div>
      </>
    );
  }

  const unopenedCount = presents.filter((p) => !p.isOpened).length;
  const themePalette = THEME_PET_PALETTES[pet.theme];

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
  const currentPetIndex = Math.max(
    0,
    pets.findIndex((p) => p.id === pet.id),
  );
  const currentFoodCost = getPetFoodCost(currentPetIndex);

  return (
    <>
      <ArcadePetSocialStage
        currentUserId={snapshot.userId || currentUserId}
        onOpenCare={() => setWidgetOpen(true)}
      />

      <ArcadePetAdoptionModal
        open={showAdoptionModal}
        onClose={() => setShowAdoptionModal(false)}
      />

      <ArcadePetGiftsModal
        open={showGiftsModal}
        onClose={() => setShowGiftsModal(false)}
      />

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
        {isWidgetOpen && (
          <div
            data-testid="arcade-pet-companion-modal"
            className="mb-3 w-80 rounded-2xl bg-neutral-900/95 border border-neutral-700/80 p-4 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{speciesEmoji}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold leading-tight">
                      {pet.stage === 'egg' ? 'Mystery Egg' : pet.name}
                    </span>
                    {pet.stage === 'egg' ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 border border-neutral-700 text-amber-300">
                        🥚 Mystery
                      </span>
                    ) : (
                      themePalette && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                          {themePalette.emoji} {themePalette.title}
                        </span>
                      )
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    {pet.stage === 'egg'
                      ? 'Incubating Egg • Grows to reveal'
                      : `Level ${pet.stats.level} ${pet.stage} • ${pets.length} Owned`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-[11px] font-bold text-amber-300"
                  title="Coins"
                >
                  <span>🪙</span>
                  <span data-testid="companion-coin-balance">
                    {coinBalance}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-[11px] font-bold text-indigo-300"
                  title="Gems"
                >
                  <span>💎</span>
                  <span>{gemBalance}</span>
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
            </div>

            {pets.length > 1 && (
              <div
                data-testid="companion-pet-selector"
                className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 border-b border-neutral-800"
              >
                {pets.map((p, idx) => {
                  const cost = getPetFoodCost(idx);
                  const isCurrent = p.id === pet.id;
                  const icon =
                    p.stage === 'egg'
                      ? '🥚'
                      : p.species === 'dragon'
                        ? '🐲'
                        : p.species === 'cyber_cat'
                          ? '🐱'
                          : p.species === 'dino'
                            ? '🦖'
                            : p.species === 'blob'
                              ? '🐡'
                              : '👾';
                  return (
                    <button
                      key={p.id}
                      type="button"
                      data-testid={`select-pet-${p.id}`}
                      onClick={() => selectActivePet(p.id)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      <span>{icon}</span>
                      <span className="truncate max-w-[80px]">
                        {p.stage === 'egg' ? 'Mystery Egg' : p.name}
                      </span>
                      <span
                        className={`text-[10px] px-1 rounded ${
                          isCurrent
                            ? 'bg-indigo-900/60 text-amber-300'
                            : 'text-amber-400'
                        }`}
                      >
                        🪙 {cost}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

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
                {isAtHome ? (
                  <div
                    data-testid="pet-home-resting-banner"
                    className="text-[11px] text-amber-200 font-medium text-center bg-amber-950/40 border border-amber-500/30 rounded py-1 px-2 flex items-center justify-center gap-1"
                  >
                    <span>🏠</span>
                    <span>
                      Resting at Home • Growth & hunger slowed to 1/3 speed
                    </span>
                  </div>
                ) : (
                  <div
                    data-testid="pet-running-banner"
                    className="text-[11px] text-emerald-300 font-medium text-center bg-emerald-950/30 border border-emerald-500/30 rounded py-1 px-2 flex items-center justify-center gap-1"
                  >
                    <span>⚡</span>
                    <span>
                      Running on Screen • Fast growth! Keep fed to grow faster.
                    </span>
                  </div>
                )}

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

                  <div
                    data-testid="pet-growth-rate-badge"
                    className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-neutral-950/70 border border-neutral-800"
                  >
                    <span className="text-neutral-400">Growth Speed</span>
                    <span
                      className={`font-bold ${
                        getGrowthSpeedPercent(pet.stats.hunger, isAtHome) >= 70
                          ? 'text-emerald-400'
                          : getGrowthSpeedPercent(pet.stats.hunger, isAtHome) >=
                              30
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {getGrowthSpeedPercent(pet.stats.hunger, isAtHome)}%
                      {pet.stats.hunger < 25 ? ' (⚠️ Hungry)' : ''}
                    </span>
                  </div>
                </div>

                {actionError && (
                  <div
                    data-testid="pet-action-error"
                    className="text-[11px] text-amber-400 font-semibold text-center bg-amber-950/40 border border-amber-500/30 rounded py-1 px-2"
                  >
                    {actionError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    data-testid="companion-feed-btn"
                    onClick={() => performAction('feed_snack')}
                    className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-center border border-neutral-700 flex items-center justify-center gap-1"
                  >
                    <span>🍰</span> Snack (🪙 {currentFoodCost})
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

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    data-testid="open-adoption-modal-btn"
                    onClick={() => setShowAdoptionModal(true)}
                    className="py-1.5 px-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-semibold text-center flex items-center justify-center gap-1"
                  >
                    <span>🥚</span> Mounts ({pets.length}/{homeCapacity})
                  </button>
                  <button
                    type="button"
                    data-testid="open-gifts-modal-btn"
                    onClick={() => setShowGiftsModal(true)}
                    className="py-1.5 px-2 rounded-lg bg-pink-950/80 hover:bg-pink-900 border border-pink-500/40 text-pink-300 text-xs font-semibold text-center flex items-center justify-center gap-1 relative"
                  >
                    <span>🎁</span> Presents
                    {unopenedCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping absolute top-1 right-1" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="arcade-pet-home-toggle-btn"
                  onClick={toggleHome}
                  className="w-full py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-center border border-neutral-700 flex items-center justify-center gap-1.5"
                >
                  <span>🏠</span>
                  <span>
                    {isAtHome
                      ? 'Call Pets Outside (Fast Growth)'
                      : 'Send Pets to Home (Slow Growth & Hunger)'}
                  </span>
                </button>

                <Link
                  href={petGameHref}
                  className="w-full mt-1 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase text-center tracking-wide block"
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
          <span className="text-xs font-bold hidden sm:inline">
            {pet.stage === 'egg' ? 'Mystery Egg' : pet.name}
          </span>
          {isAtHome && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 border border-amber-400/50 text-[10px] text-amber-200 font-semibold">
              💤 Home
            </span>
          )}
          {unopenedCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px] font-bold">
              🎁 {unopenedCount}
            </span>
          ) : !isAtHome ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ) : null}
        </button>
      </div>
    </>
  );
};
