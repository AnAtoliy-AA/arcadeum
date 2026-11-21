'use client';

import React, { useState } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useTranslation } from '@/shared/i18n/useTranslation';
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

/** Free gems are a development convenience only; never shown in production. */
const SHOW_DEV_GEM_GRANT = process.env.NODE_ENV !== 'production';

interface ArcadePetAdoptionModalProps {
  open: boolean;
  onClose: () => void;
}

export function ArcadePetAdoptionModal({
  open,
  onClose,
}: ArcadePetAdoptionModalProps) {
  const { t } = useTranslation();
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
        setErrorMsg(
          t('arcadePetCompanion.adoption.errCoins', {
            cost: upgradeCost.coinCost,
          }),
        );
      } else if (result.error === 'INSUFFICIENT_GEMS') {
        setErrorMsg(
          t('arcadePetCompanion.adoption.errGemsUpgrade', {
            cost: upgradeCost.gemCost,
          }),
        );
      } else {
        setErrorMsg(t('arcadePetCompanion.adoption.errUpgrade'));
      }
      return;
    }
    setSuccessMsg(
      t('arcadePetCompanion.adoption.okUpgrade', { places: homeCapacity + 1 }),
    );
  };

  const handleAdoptRandom = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = adoptRandomPet();
    if (!result.success) {
      if (result.error === 'HOME_FULL') {
        setErrorMsg(
          t('arcadePetCompanion.adoption.errHomeFull', {
            used: pets.length,
            total: homeCapacity,
          }),
        );
      } else if (result.error === 'INSUFFICIENT_GEMS') {
        setErrorMsg(
          t('arcadePetCompanion.adoption.errGemsAdopt', {
            cost: nextCost,
            gems: gemBalance,
          }),
        );
      } else {
        setErrorMsg(t('arcadePetCompanion.adoption.errAdopt'));
      }
      return;
    }
    setSuccessMsg(
      t('arcadePetCompanion.adoption.okAdopted', {
        name: result.pet?.name ?? '',
      }),
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
          t('arcadePetCompanion.adoption.errHomeFull', {
            used: pets.length,
            total: homeCapacity,
          }),
        );
      } else if (result.error === 'INSUFFICIENT_GEMS') {
        setErrorMsg(
          t('arcadePetCompanion.adoption.errGemsSelect', {
            cost: SELECT_PET_COST,
            gems: gemBalance,
          }),
        );
      } else {
        setErrorMsg(t('arcadePetCompanion.adoption.errSelect'));
      }
      return;
    }
    setSuccessMsg(
      t('arcadePetCompanion.adoption.okSelected', {
        name: result.pet?.name ?? '',
      }),
    );
  };

  return (
    <div
      data-testid="arcade-pet-adoption-modal"
      role="dialog"
      aria-modal="true"
      aria-label={t('arcadePetCompanion.adoption.title')}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl text-white font-sans flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥚</span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white">
                {t('arcadePetCompanion.adoption.title')}
              </span>
              <span className="text-xs text-neutral-400">
                {t('arcadePetCompanion.adoption.subtitle')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300"
              title={t('arcadePetCompanion.adoption.placesTitle')}
              data-testid="home-places-badge"
            >
              <span>🏠</span>
              <span>
                {t('arcadePetCompanion.adoption.placesTag', {
                  used: pets.length,
                  total: homeCapacity,
                })}
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
              aria-label={t('arcadePetCompanion.close')}
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
            {t('arcadePetCompanion.adoption.tabRandom', {
              price: isFirstMountFree
                ? t('arcadePetCompanion.adoption.tierFree')
                : `💎 ${nextCost}`,
            })}
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
            {t('arcadePetCompanion.adoption.tabSelect', {
              cost: SELECT_PET_COST,
            })}
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
            {t('arcadePetCompanion.adoption.tabCollection', {
              count: pets.length,
            })}
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
                {t('arcadePetCompanion.adoption.themeGuaranteed', {
                  theme:
                    THEME_PET_PALETTES[queuedThemeForNextPet]?.title ??
                    queuedThemeForNextPet,
                })}
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
                  {t('arcadePetCompanion.adoption.homeFull', {
                    used: pets.length,
                    total: homeCapacity,
                  })}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                {t('arcadePetCompanion.adoption.homeFullHint')}
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  data-testid="upgrade-home-coins-btn"
                  onClick={() => handleUpgradeHome('coins')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                >
                  <span>🪙</span>{' '}
                  {t('arcadePetCompanion.adoption.upgradeCoins', {
                    cost: upgradeCost.coinCost,
                  })}
                </button>
                <button
                  type="button"
                  data-testid="upgrade-home-gems-btn"
                  onClick={() => handleUpgradeHome('gems')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                >
                  <span>💎</span>{' '}
                  {t('arcadePetCompanion.adoption.upgradeGems', {
                    cost: upgradeCost.gemCost,
                  })}
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
                      ? t('arcadePetCompanion.adoption.firstTitle')
                      : t('arcadePetCompanion.adoption.nextTitle', {
                          cost: nextCost,
                        })}
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    {isFirstMountFree
                      ? t('arcadePetCompanion.adoption.firstBody')
                      : t('arcadePetCompanion.adoption.nextBody', {
                          cost: nextCost,
                        })}
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
                    ? t('arcadePetCompanion.adoption.upgradeToAdopt')
                    : isFirstMountFree
                      ? t('arcadePetCompanion.adoption.rollFirst')
                      : t('arcadePetCompanion.adoption.rollRandom', {
                          cost: nextCost,
                        })}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-400 space-y-2">
                <span className="font-bold text-neutral-300 block">
                  {t('arcadePetCompanion.adoption.progressionTitle')}
                </span>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  {[
                    {
                      label: t('arcadePetCompanion.adoption.tier1'),
                      cost: t('arcadePetCompanion.adoption.tierFree'),
                      color: 'text-emerald-400',
                    },
                    {
                      label: t('arcadePetCompanion.adoption.tier2'),
                      cost: '💎 50',
                      color: 'text-indigo-300',
                    },
                    {
                      label: t('arcadePetCompanion.adoption.tier3'),
                      cost: '💎 150',
                      color: 'text-indigo-300',
                    },
                    {
                      label: t('arcadePetCompanion.adoption.tier4'),
                      cost: '💎 300',
                      color: 'text-indigo-300',
                    },
                    {
                      label: t('arcadePetCompanion.adoption.tier5'),
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
                    {t('arcadePetCompanion.adoption.themesTitle')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-semibold">
                    {t('arcadePetCompanion.adoption.themesBadge')}
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

              {SHOW_DEV_GEM_GRANT && (
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                  <span>{t('arcadePetCompanion.adoption.needGems')}</span>
                  <button
                    type="button"
                    data-testid="add-bonus-gems-btn"
                    onClick={() => addGems(100)}
                    className="px-3 py-1 rounded-lg bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-500/40 text-indigo-300 font-semibold"
                  >
                    {t('arcadePetCompanion.adoption.bonusGems')}
                  </button>
                </div>
              )}
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
