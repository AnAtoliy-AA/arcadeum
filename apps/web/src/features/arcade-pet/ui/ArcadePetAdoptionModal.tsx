'use client';

import React, { useState } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useShallow } from 'zustand/react/shallow';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Notice,
  TabBar,
} from '@arcadeum/ui';
import { useArcadePetStore } from '../store/useArcadePetStore';
import {
  getHomeUpgradeCost,
  getPetAdoptionCost,
  SELECT_PET_COST,
  getPetByThemeAndSpecies,
} from '../lib/arcade-pet-economy';
import { SPECIES_PALETTE } from '../lib/arcade-pet-palette';
import { ArcadePetCollectionList } from './ArcadePetCollectionList';
import { ArcadePetAdoptionRandomTab } from './ArcadePetAdoptionRandomTab';
import { ArcadePetVipSelectionTab } from './ArcadePetVipSelectionTab';

type AdoptionTab = 'random' | 'select' | 'collection';

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
  } = useArcadePetStore(
    useShallow((s) => ({
      gemBalance: s.gemBalance,
      adoptionCount: s.adoptionCount,
      homeCapacity: s.homeCapacity,
      pets: s.pets,
      activePetId: s.activePetId,
      queuedThemeForNextPet: s.queuedThemeForNextPet,
      adoptRandomPet: s.adoptRandomPet,
      adoptSelectedPet: s.adoptSelectedPet,
      upgradeHome: s.upgradeHome,
      selectActivePet: s.selectActivePet,
    })),
  );

  const [activeTab, setActiveTab] = useState<AdoptionTab>('random');
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies>('dragon');
  const [selectedTheme, setSelectedTheme] = useState<string>('cyberpunk');
  const [customName, setCustomName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      `${SPECIES_PALETTE[selectedTheme]?.title ?? ''} ${selectedSpecies}`;
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

  const tabs = [
    {
      id: 'random',
      testId: 'tab-random-pet',
      label: t('arcadePetCompanion.adoption.tabRandom', {
        price: isFirstMountFree
          ? t('arcadePetCompanion.adoption.tierFree')
          : `💎 ${nextCost}`,
      }),
    },
    {
      id: 'select',
      testId: 'tab-select-pet',
      label: t('arcadePetCompanion.adoption.tabSelect', {
        cost: SELECT_PET_COST,
      }),
    },
    {
      id: 'collection',
      testId: 'tab-my-collection',
      label: t('arcadePetCompanion.adoption.tabCollection', {
        count: pets.length,
      }),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabelledBy="arcade-pet-adoption-title"
    >
      <ModalContent data-testid="arcade-pet-adoption-modal" maxWidth={512}>
        <ModalHeader
          onClose={onClose}
          closeLabel={t('arcadePetCompanion.close')}
        >
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-2xl">
              🥚
            </span>
            <div className="flex flex-col">
              <span
                id="arcade-pet-adoption-title"
                className="text-base font-bold text-[var(--color)]"
              >
                {t('arcadePetCompanion.adoption.title')}
              </span>
              <span className="text-xs text-[var(--textSecondary)]">
                {t('arcadePetCompanion.adoption.subtitle')}
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-full border border-[var(--success)] px-2.5 py-1 text-xs font-bold text-[var(--color)]"
              title={t('arcadePetCompanion.adoption.placesTitle')}
              data-testid="home-places-badge"
            >
              <span aria-hidden="true">🏠</span>
              <span>
                {t('arcadePetCompanion.adoption.placesTag', {
                  used: pets.length,
                  total: homeCapacity,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--primary)] px-3 py-1 text-xs font-bold text-[var(--color)]">
              <span aria-hidden="true">💎</span>
              <span>{gemBalance}</span>
            </div>
          </div>
        </ModalHeader>

        <TabBar
          aria-label={t('arcadePetCompanion.a11y.adoptionTabs')}
          items={tabs}
          value={activeTab}
          onChange={(id) => setActiveTab(id as AdoptionTab)}
        />

        <ModalBody className="space-y-4">
          {errorMsg && (
            <Notice tone="danger" role="alert">
              {errorMsg}
            </Notice>
          )}
          {successMsg && <Notice tone="success">{successMsg}</Notice>}

          {queuedThemeForNextPet && (
            <Notice tone="accent" icon="✨">
              {t('arcadePetCompanion.adoption.themeGuaranteed', {
                theme:
                  SPECIES_PALETTE[queuedThemeForNextPet]?.title ??
                  queuedThemeForNextPet,
              })}
            </Notice>
          )}

          {isHomeFull && (
            <Notice
              tone="warning"
              icon="🏠"
              data-testid="home-full-banner"
              className="text-center"
            >
              <p className="font-bold">
                {t('arcadePetCompanion.adoption.homeFull', {
                  used: pets.length,
                  total: homeCapacity,
                })}
              </p>
              <p className="mt-1">
                {t('arcadePetCompanion.adoption.homeFullHint')}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  data-testid="upgrade-home-coins-btn"
                  onClick={() => handleUpgradeHome('coins')}
                >
                  <span aria-hidden="true">🪙</span>{' '}
                  {t('arcadePetCompanion.adoption.upgradeCoins', {
                    cost: upgradeCost.coinCost,
                  })}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  data-testid="upgrade-home-gems-btn"
                  onClick={() => handleUpgradeHome('gems')}
                >
                  <span aria-hidden="true">💎</span>{' '}
                  {t('arcadePetCompanion.adoption.upgradeGems', {
                    cost: upgradeCost.gemCost,
                  })}
                </Button>
              </div>
            </Notice>
          )}

          {activeTab === 'random' && (
            <ArcadePetAdoptionRandomTab
              isFirstMountFree={isFirstMountFree}
              nextCost={nextCost}
              isHomeFull={isHomeFull}
              onAdopt={handleAdoptRandom}
            />
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
