'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/shared/i18n/useLanguage';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useShallow } from 'zustand/react/shallow';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { useArcadePetSync } from '../hooks/useArcadePetSync';
import { ArcadePetSocialStage } from './ArcadePetSocialStage';
import { ArcadePetAdoptionModal } from './ArcadePetAdoptionModal';
import { ArcadePetGiftsModal } from './ArcadePetGiftsModal';
import { ArcadePetCommitmentModal } from './ArcadePetCommitmentModal';
import { getPetFoodCost } from '../lib/arcade-pet-economy';
import { SPECIES_PALETTE } from '../lib/arcade-pet-palette';
import { ArcadePetRegisterPrompt } from './ArcadePetRegisterPrompt';
import { getPetAttention } from '../lib/arcade-pet-attention';
import { ArcadePetCompanionHeader } from './ArcadePetCompanionHeader';
import { ArcadePetStatusPanel } from './ArcadePetStatusPanel';
import { ArcadePetMilestoneToast } from './ArcadePetMilestoneToast';
import { ArcadePetDailyBonus } from './ArcadePetDailyBonus';
import { Button, Notice } from '@arcadeum/ui';
import { ArcadePetAwayBanner } from './ArcadePetAwayBanner';
import { useArcadePetFeatureDisabled } from '../hooks/useArcadePetFeatureDisabled';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface ArcadePetCompanionWidgetProps {
  currentUserId?: string;
  theme?: string;
}

export const ArcadePetCompanionWidget: React.FC<
  ArcadePetCompanionWidgetProps
> = ({ currentUserId, theme }) => {
  const { t } = useTranslation();
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
    awaySummary,
    dismissAwaySummary,
    dailyStreak,
    lastDailyClaimDay,
    claimDailyBonus,
    renamePet,
    newMilestones,
    dismissMilestones,
    checkMilestones,
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
    syncPending,
  } = useArcadePetStore(
    useShallow((s) => ({
      pet: s.pet,
      pets: s.pets,
      gemBalance: s.gemBalance,
      coinBalance: s.coinBalance,
      actionError: s.actionError,
      awaySummary: s.awaySummary,
      dismissAwaySummary: s.dismissAwaySummary,
      dailyStreak: s.dailyStreak,
      lastDailyClaimDay: s.lastDailyClaimDay,
      claimDailyBonus: s.claimDailyBonus,
      renamePet: s.renamePet,
      newMilestones: s.newMilestones,
      dismissMilestones: s.dismissMilestones,
      checkMilestones: s.checkMilestones,
      presents: s.presents,
      isWidgetOpen: s.isWidgetOpen,
      isAtHome: s.isAtHome,
      initialize: s.initialize,
      performAction: s.performAction,
      toggleWidget: s.toggleWidget,
      setWidgetOpen: s.setWidgetOpen,
      toggleHome: s.toggleHome,
      adoptRandomPet: s.adoptRandomPet,
      selectActivePet: s.selectActivePet,
      homeCapacity: s.homeCapacity,
      syncPending: s.syncPending,
    })),
  );

  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [showGiftsModal, setShowGiftsModal] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const isFeatureDisabled = useArcadePetFeatureDisabled(snapshot.accessToken);

  useEffect(() => {
    initialize(currentUserId, theme);
  }, [currentUserId, theme, initialize]);

  const { status: syncStatus, retry: retrySync } = useArcadePetSync(
    Boolean(snapshot.accessToken),
  );

  useEffect(() => {
    checkMilestones();
  }, [pets, dailyStreak, checkMilestones]);

  if (pathname?.includes('/games/arcade-pet') || isFeatureDisabled) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
        {showRegisterPrompt && (
          <ArcadePetRegisterPrompt
            locale={locale}
            onClose={() => setShowRegisterPrompt(false)}
          />
        )}

        <button
          type="button"
          aria-disabled="true"
          data-testid="arcade-pet-companion-trigger"
          onClick={() => setShowRegisterPrompt((prev) => !prev)}
          title={t('arcadePetCompanion.registerTriggerTitle')}
          aria-label={t('arcadePetCompanion.registerTriggerAria')}
          aria-expanded={showRegisterPrompt}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--glassBorderStrong)] bg-[var(--glassBg)] px-3 py-1.5 text-[var(--color)] opacity-80 shadow-lg backdrop-blur-md transition-all hover:border-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <span aria-hidden="true" className="text-lg">
            🔒
          </span>
          <span className="text-xs font-bold">
            {t('arcadePetCompanion.registerForPet')}
          </span>
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
          <Button
            variant="primary"
            size="sm"
            shape="round"
            data-testid="arcade-pet-companion-trigger"
            disabled={syncPending}
            onClick={() => setShowCommitmentModal(true)}
            aria-label={t('arcadePetCompanion.adoptFreeAria')}
            className="gap-2 px-3.5 disabled:cursor-wait"
          >
            <span aria-hidden="true" className="text-lg">
              🥚
            </span>
            <span className="text-xs font-bold">
              {t('arcadePetCompanion.adoptFreeAria')} 🐾
            </span>
          </Button>
        </div>
      </>
    );
  }

  const unopenedCount = presents.filter((p) => !p.isOpened).length;
  const attention = getPetAttention(pet, isAtHome);
  const triggerLabel =
    attention.length > 0
      ? `${t('arcadePetCompanion.toggleCompanion')}. ${t(
          'arcadePetCompanion.attentionAria',
          {
            needs: attention
              .map((r) => t(`arcadePetCompanion.attention.${r}`))
              .join(', '),
          },
        )}`
      : t('arcadePetCompanion.toggleCompanion');
  const themePalette = SPECIES_PALETTE[pet.theme];

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
        syncStatus={syncStatus}
        onRetrySync={retrySync}
      />

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
        {isWidgetOpen && (
          <div
            data-testid="arcade-pet-companion-modal"
            className="mb-3 w-80 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorderStrong)] p-4 shadow-2xl backdrop-blur-md text-[var(--color)] font-sans flex flex-col gap-3 max-h-[calc(100dvh-8rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden"
          >
            <ArcadePetCompanionHeader
              pet={pet}
              petCount={pets.length}
              speciesEmoji={speciesEmoji}
              themePalette={themePalette}
              coinBalance={coinBalance}
              gemBalance={gemBalance}
              onClose={toggleWidget}
              onRename={(name) => renamePet(pet.id, name)}
            />

            {pets.length > 1 && (
              <div
                data-testid="companion-pet-selector"
                className="flex flex-wrap items-center gap-1.5 pb-1 pt-0.5 border-b border-[var(--glassBorder)]"
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
                    <Button
                      key={p.id}
                      variant="chip"
                      size="sm"
                      active={isCurrent}
                      aria-pressed={isCurrent}
                      data-testid={`select-pet-${p.id}`}
                      onClick={() => selectActivePet(p.id)}
                      className="shrink-0 gap-1 text-xs font-semibold"
                    >
                      <span aria-hidden="true">{icon}</span>
                      <span className="max-w-[80px] truncate">
                        {p.stage === 'egg'
                          ? t('arcadePetCompanion.mysteryEgg')
                          : p.name}
                      </span>
                      <span className="text-xs">🪙 {cost}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            {pet.stage === 'egg' ? (
              <div className="flex flex-col items-center py-2 text-center gap-2">
                <span className="text-xs text-neutral-300">
                  {t('arcadePetCompanion.eggResting')}
                </span>
                <Link
                  href={petGameHref}
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase text-center"
                >
                  {t('arcadePetCompanion.hatchCta')}
                </Link>
              </div>
            ) : (
              <>
                <ArcadePetStatusPanel pet={pet} isAtHome={isAtHome} />

                {awaySummary && (
                  <ArcadePetAwayBanner
                    summary={awaySummary}
                    onDismiss={dismissAwaySummary}
                  />
                )}

                <ArcadePetMilestoneToast
                  notices={newMilestones}
                  onDismiss={dismissMilestones}
                />

                <ArcadePetDailyBonus
                  lastClaimDay={lastDailyClaimDay}
                  streak={dailyStreak}
                  onClaim={claimDailyBonus}
                />

                {actionError && (
                  <Notice
                    tone="warning"
                    role="alert"
                    data-testid="pet-action-error"
                    className="text-center font-semibold"
                  >
                    {t(
                      `arcadePetCompanion.errors.${actionError.code}`,
                      actionError.params,
                    )}
                  </Notice>
                )}

                {syncStatus === 'error' && (
                  <Notice
                    tone="info"
                    data-testid="pet-sync-error"
                    onDismiss={retrySync}
                    dismissLabel={t('arcadePetCompanion.states.retry')}
                    dismissTestId="pet-sync-retry"
                  >
                    {t('arcadePetCompanion.states.syncError')}
                  </Notice>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="glass"
                    size="sm"
                    data-testid="companion-feed-btn"
                    disabled={syncPending}
                    onClick={() => performAction('feed_snack')}
                    className="text-xs font-semibold"
                  >
                    <span aria-hidden="true">🍰</span>{' '}
                    {t('arcadePetCompanion.snackBtn', {
                      cost: currentFoodCost,
                    })}
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    data-testid="companion-praise-btn"
                    onClick={() => performAction('praise')}
                    className="text-xs font-semibold"
                  >
                    <span aria-hidden="true">❤️</span>{' '}
                    {t('arcadePetCompanion.petBtn')}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="glass"
                    size="sm"
                    data-testid="open-adoption-modal-btn"
                    disabled={syncPending}
                    onClick={() => setShowAdoptionModal(true)}
                    className="text-xs font-semibold"
                  >
                    <span aria-hidden="true">🥚</span>{' '}
                    {t('arcadePetCompanion.mountsBtn', {
                      used: pets.length,
                      total: homeCapacity,
                    })}
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    data-testid="open-gifts-modal-btn"
                    onClick={() => setShowGiftsModal(true)}
                    className="text-xs font-semibold"
                  >
                    <span aria-hidden="true">🎁</span>{' '}
                    {t('arcadePetCompanion.presentsBtn')}
                    {unopenedCount > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute right-1 top-1 h-2 w-2 animate-ping rounded-full bg-[var(--primary)] motion-reduce:animate-none"
                      />
                    )}
                  </Button>
                </div>

                <Button
                  variant="glass"
                  size="sm"
                  fullWidth
                  data-testid="arcade-pet-home-toggle-btn"
                  onClick={toggleHome}
                  className="text-xs font-semibold"
                >
                  <span aria-hidden="true">🏠</span>{' '}
                  {isAtHome
                    ? t('arcadePetCompanion.callOutside')
                    : t('arcadePetCompanion.sendHome')}
                </Button>

                <Link
                  href={petGameHref}
                  className="w-full mt-1 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase text-center tracking-wide block"
                >
                  {t('arcadePetCompanion.openGameRoom')}
                </Link>
              </>
            )}
          </div>
        )}

        <Button
          variant="glass"
          size="sm"
          shape="round"
          data-testid="arcade-pet-companion-trigger"
          onClick={toggleWidget}
          aria-label={triggerLabel}
          aria-expanded={isWidgetOpen}
          className="gap-2 px-3"
        >
          <span aria-hidden="true" className="text-lg">
            {speciesEmoji}
          </span>
          <span className="text-xs font-bold hidden sm:inline">
            {pet.stage === 'egg'
              ? t('arcadePetCompanion.mysteryEgg')
              : pet.name}
          </span>
          {isAtHome && (
            <span className="px-1.5 py-0.2 rounded-full border border-[var(--warning)] text-xs font-semibold">
              {t('arcadePetCompanion.homeBadge')}
            </span>
          )}
          {unopenedCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--primary)] text-[var(--primaryText)] text-xs font-bold">
              🎁 {unopenedCount}
            </span>
          ) : attention.length > 0 ? (
            <span
              data-testid="pet-attention-indicator"
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse motion-reduce:animate-none"
            />
          ) : !isAtHome ? (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse motion-reduce:animate-none" />
          ) : null}
        </Button>
      </div>
    </>
  );
};
