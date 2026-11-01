'use client';

import React, { useState } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useArcadePetStore } from '../store/useArcadePetStore';
import {
  getPetAdoptionCost,
  SELECT_PET_COST,
  THEME_PET_PALETTES,
  getSignaturePet,
  getPetByThemeAndSpecies,
} from '../lib/arcade-pet-economy';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';

interface ArcadePetAdoptionModalProps {
  open: boolean;
  onClose: () => void;
}

const SPECIES_OPTIONS: readonly {
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

export function ArcadePetAdoptionModal({
  open,
  onClose,
}: ArcadePetAdoptionModalProps) {
  const {
    gemBalance,
    adoptionCount,
    pets,
    activePetId,
    queuedThemeForNextPet,
    adoptRandomPet,
    adoptSelectedPet,
    selectActivePet,
    addGems,
  } = useArcadePetStore();

  const [activeTab, setActiveTab] = useState<
    'random' | 'select' | 'collection'
  >('random');
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies>('dragon');
  const [selectedTheme, setSelectedTheme] = useState<string>('cyberpunk');
  const [customName, setCustomName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!open) return null;

  const nextCost = getPetAdoptionCost(adoptionCount);
  const isFirstMountFree = adoptionCount === 0;

  const handleAdoptRandom = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = adoptRandomPet();
    if (!result.success) {
      if (result.error === 'INSUFFICIENT_GEMS') {
        setErrorMsg(
          `Need 💎 ${nextCost} gems to adopt. You have 💎 ${gemBalance}.`,
        );
      } else {
        setErrorMsg('Could not adopt pet. Please try again.');
      }
      return;
    }
    setSuccessMsg(
      `Adopted ${result.pet?.name}! Check your collection to walk together.`,
    );
  };

  const handleAdoptSelected = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const defaultName =
      getPetByThemeAndSpecies(selectedTheme, selectedSpecies)?.name ||
      `${THEME_PET_PALETTES[selectedTheme]?.title ?? ''} ${selectedSpecies}`;
    const result = adoptSelectedPet(
      selectedSpecies,
      selectedTheme,
      customName.trim() || defaultName,
    );
    if (!result.success) {
      if (result.error === 'INSUFFICIENT_GEMS') {
        setErrorMsg(
          `Need 💎 ${SELECT_PET_COST} gems. You have 💎 ${gemBalance}.`,
        );
      } else {
        setErrorMsg('Could not select pet.');
      }
      return;
    }
    setSuccessMsg(`VIP Pet ${result.pet?.name} selected and equipped!`);
  };

  return (
    <div
      data-testid="arcade-pet-adoption-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl text-white font-sans flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥚</span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white">
                Companion Mount Nursery
              </span>
              <span className="text-xs text-neutral-400">
                Random rolls, theme guarantees, and VIP pet selection
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-xs font-bold text-indigo-300">
              <span>💎</span>
              <span>{gemBalance}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 text-sm"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex border-b border-neutral-800 bg-neutral-950/60 text-xs font-semibold">
          <button
            type="button"
            data-testid="tab-random-pet"
            onClick={() => setActiveTab('random')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'random'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Random Mount ({isFirstMountFree ? 'FREE' : `💎 ${nextCost}`})
          </button>
          <button
            type="button"
            data-testid="tab-select-pet"
            onClick={() => setActiveTab('select')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'select'
                ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Select Pet (💎 {SELECT_PET_COST})
          </button>
          <button
            type="button"
            data-testid="tab-my-collection"
            onClick={() => setActiveTab('collection')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'collection'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            My Pets ({pets.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200">
              {successMsg}
            </div>
          )}

          {queuedThemeForNextPet && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-900/40 border border-indigo-500/40 text-xs text-indigo-300">
              <span className="text-base">✨</span>
              <span>
                Theme Guaranteed: Next pet will emerge with{' '}
                <strong className="text-white uppercase font-bold">
                  {THEME_PET_PALETTES[queuedThemeForNextPet]?.title ??
                    queuedThemeForNextPet}
                </strong>{' '}
                theme!
              </span>
            </div>
          )}

          {activeTab === 'random' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-3">
                <div className="inline-flex p-4 rounded-full bg-neutral-900 border border-indigo-500/30 text-4xl animate-pulse">
                  🎁
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    {isFirstMountFree
                      ? 'Adopt Your First Companion (Free!)'
                      : `Summon Random Mount (💎 ${nextCost} Gems)`}
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    {isFirstMountFree
                      ? 'Your very first companion mount is free! Rolls a random theme and species to walk on your screen.'
                      : `Each next mount escalates in gem cost. Current price: 💎 ${nextCost} gems.`}
                  </p>
                </div>

                <button
                  type="button"
                  data-testid="adopt-random-btn"
                  onClick={handleAdoptRandom}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg transition-transform active:scale-95"
                >
                  {isFirstMountFree
                    ? 'Roll First Mount (FREE)'
                    : `Roll Random Pet (💎 ${nextCost} Gems)`}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 space-y-2">
                <span className="font-bold text-neutral-300 block">
                  Mount Cost Progression
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="block text-neutral-400">1st</span>
                    <span className="font-bold text-emerald-400">FREE</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="block text-neutral-400">2nd</span>
                    <span className="font-bold text-indigo-300">💎 50</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="block text-neutral-400">3rd</span>
                    <span className="font-bold text-indigo-300">💎 150</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="block text-neutral-400">4th</span>
                    <span className="font-bold text-indigo-300">💎 300</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="block text-neutral-400">5th+</span>
                    <span className="font-bold text-indigo-300">💎 500+</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-300 block">
                    Game Theme Pets (5 Pets per Theme)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-semibold">
                    13 Themes • 65 Total Pets
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                  {Object.values(THEME_PET_PALETTES).map((pal) => {
                    const signature = getSignaturePet(pal.id);
                    return (
                      <div
                        key={pal.id}
                        data-testid={`theme-pet-card-${pal.id}`}
                        className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{pal.emoji}</span>
                          <span className="font-bold text-white text-[11px] truncate">
                            {pal.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-indigo-300 font-medium truncate">
                          ⭐ {signature.name}
                        </span>
                        <span className="text-[9px] text-neutral-400 line-clamp-1">
                          {signature.tagline}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <span>Need gems for companion pets?</span>
                <button
                  type="button"
                  data-testid="add-bonus-gems-btn"
                  onClick={() => addGems(100)}
                  className="px-3 py-1 rounded-lg bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-500/40 text-indigo-300 font-semibold"
                >
                  +100 Bonus 💎
                </button>
              </div>
            </div>
          )}

          {activeTab === 'select' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200">
                <strong>VIP Pet Crafting (💎 {SELECT_PET_COST} Gems):</strong>{' '}
                Directly choose species and visual theme for your companion.
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
                      onClick={() => setSelectedSpecies(spec.id)}
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
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-2 rounded-xl text-left border flex items-center gap-1.5 transition-all ${
                        selectedTheme === theme.id
                          ? 'border-amber-400 bg-amber-500/20 text-white font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{theme.emoji}</span>
                      <span className="text-[11px] truncate">
                        {theme.title}
                      </span>
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
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Neon Phantom, Solis, Jade..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                data-testid="adopt-selected-btn"
                onClick={handleAdoptSelected}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-sm shadow-lg transition-transform active:scale-95"
              >
                Select & Equip (💎 {SELECT_PET_COST} Gems)
              </button>
            </div>
          )}

          {activeTab === 'collection' && (
            <div className="space-y-3">
              <span className="text-xs text-neutral-400 block">
                Select which companion walks on your screen:
              </span>
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
                          species={p.stage === 'egg' ? 'blob' : p.species}
                          state="idle"
                          theme={p.theme}
                          className="w-10 h-10"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            {p.name}
                            {palette && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                                {palette.emoji} {palette.title}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Level {p.stats.level} • {p.species} • {p.stage}
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
                          onClick={() => selectActivePet(p.id)}
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
          )}
        </div>
      </div>
    </div>
  );
}
