'use client';

import React, { useState } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useArcadePetStore } from '../store/useArcadePetStore';
import {
  getHomeUpgradeCost,
  getPetAdoptionCost,
  SELECT_PET_COST,
  THEME_PET_PALETTES,
  getSignaturePet,
  getPetByThemeAndSpecies,
} from '../lib/arcade-pet-economy';
import { ArcadePetCollectionList } from './ArcadePetCollectionList';
import { ArcadePetVipSelectionTab } from './ArcadePetVipSelectionTab';

interface ArcadePetAdoptionModalProps {
  open: boolean;
  onClose: () => void;
}

export function ArcadePetAdoptionModal({
  open,
  onClose,
}: ArcadePetAdoptionModalProps) {
  const {
    gemBalance,
    adoptionCount,
    homeCapacity,
    pets,
    activePetId,
    queuedThemeForNextPet,
    adoptRandomPet,
    adoptSelectedPet,
    upgradeHome,
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
  const isHomeFull = pets.length >= homeCapacity;
  const upgradeCost = getHomeUpgradeCost(homeCapacity);

  const handleUpgradeHome = (currency: 'coins' | 'gems') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = upgradeHome(currency);
    if (!result.success) {
      if (result.error === 'INSUFFICIENT_COINS') {
        setErrorMsg(`Need 🪙 ${upgradeCost.coinCost} Coins to upgrade Home!`);
      } else if (result.error === 'INSUFFICIENT_GEMS') {
        setErrorMsg(`Need 💎 ${upgradeCost.gemCost} Gems to upgrade Home!`);
      } else {
        setErrorMsg('Could not upgrade Home.');
      }
      return;
    }
    setSuccessMsg(`Upgraded Home capacity to ${homeCapacity + 1} places! 🏠`);
  };

  const handleAdoptRandom = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = adoptRandomPet();
    if (!result.success) {
      if (result.error === 'HOME_FULL') {
        setErrorMsg(
          `Home is full (${pets.length}/${homeCapacity})! Upgrade Home to adopt more pets.`,
        );
      } else if (result.error === 'INSUFFICIENT_GEMS') {
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
      if (result.error === 'HOME_FULL') {
        setErrorMsg(
          `Home is full (${pets.length}/${homeCapacity})! Upgrade Home to adopt more pets.`,
        );
      } else if (result.error === 'INSUFFICIENT_GEMS') {
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
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300"
              title="Home Places"
              data-testid="home-places-badge"
            >
              <span>🏠</span>
              <span>
                {pets.length}/{homeCapacity} Places
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-xs font-bold text-indigo-300">
              <span>💎</span>
              <span>{gemBalance}</span>
            </div>
            <button
              type="button"
              data-testid="close-adoption-modal-btn"
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

          {isHomeFull && (
            <div
              data-testid="home-full-banner"
              className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 flex flex-col gap-2 text-center"
            >
              <div className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5">
                <span>🏠</span>
                <span>
                  Home is Full ({pets.length}/{homeCapacity} Places)
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                To adopt a pet, your home needs enough place! Upgrade with Coins
                or Gems:
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  data-testid="upgrade-home-coins-btn"
                  onClick={() => handleUpgradeHome('coins')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                >
                  <span>🪙</span> Upgrade (🪙 {upgradeCost.coinCost})
                </button>
                <button
                  type="button"
                  data-testid="upgrade-home-gems-btn"
                  onClick={() => handleUpgradeHome('gems')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                >
                  <span>💎</span> Upgrade (💎 {upgradeCost.gemCost})
                </button>
              </div>
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
                  disabled={isHomeFull}
                  onClick={handleAdoptRandom}
                  className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 ${
                    isHomeFull
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                  }`}
                >
                  {isHomeFull
                    ? '🏠 Upgrade Home to Adopt'
                    : isFirstMountFree
                      ? 'Roll First Mount (FREE)'
                      : `Roll Random Pet (💎 ${nextCost} Gems)`}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 space-y-2">
                <span className="font-bold text-neutral-300 block">
                  Mount Cost Progression
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  {[
                    { label: '1st', cost: 'FREE', color: 'text-emerald-400' },
                    { label: '2nd', cost: '💎 50', color: 'text-indigo-300' },
                    { label: '3rd', cost: '💎 150', color: 'text-indigo-300' },
                    { label: '4th', cost: '💎 300', color: 'text-indigo-300' },
                    {
                      label: '5th+',
                      cost: '💎 500+',
                      color: 'text-indigo-300',
                    },
                  ].map((tier) => (
                    <div
                      key={tier.label}
                      className="p-2 rounded bg-neutral-900 border border-neutral-800"
                    >
                      <span className="block text-neutral-400">
                        {tier.label}
                      </span>
                      <span className={`font-bold ${tier.color}`}>
                        {tier.cost}
                      </span>
                    </div>
                  ))}
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
            <ArcadePetVipSelectionTab
              selectedSpecies={selectedSpecies}
              onSelectSpecies={setSelectedSpecies}
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
              customName={customName}
              onChangeCustomName={setCustomName}
              isHomeFull={isHomeFull}
              onAdoptSelected={handleAdoptSelected}
            />
          )}

          {activeTab === 'collection' && (
            <ArcadePetCollectionList
              pets={pets}
              activePetId={activePetId}
              onSelectPet={selectActivePet}
            />
          )}
        </div>
      </div>
    </div>
  );
}
