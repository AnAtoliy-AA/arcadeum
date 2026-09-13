'use client';

import React, { useCallback } from 'react';
import {
  Button,
  CloseIcon,
  CosmeticSprite,
  Modal,
  ModalContent,
} from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { getRewardForLevel } from '@/shared/lib/level-rewards';
import { useLevelUpModalStore } from '../store/levelUpModalStore';
import { claimLevelRewards } from '../api/level-rewards.api';

export function LevelUpModal() {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const {
    isOpen,
    level,
    coinAmount,
    badgeId,
    isClaiming,
    isClaimed,
    closeModal,
    setClaiming,
    setClaimed,
  } = useLevelUpModalStore();

  const reward = badgeId ? getRewardForLevel(level) : undefined;

  const handleClaim = useCallback(async () => {
    if (isClaiming || isClaimed) return;
    setClaiming(true);
    try {
      await claimLevelRewards(snapshot.accessToken);
      setClaimed(true);
    } finally {
      setClaiming(false);
    }
  }, [isClaiming, isClaimed, setClaiming, setClaimed, snapshot.accessToken]);

  return (
    <Modal open={isOpen} onClose={closeModal}>
      <ModalContent maxWidth="420px" data-testid="level-up-modal">
        <div className="relative p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />

          <button
            type="button"
            onClick={closeModal}
            data-testid="level-up-close-btn"
            aria-label="Close"
            className="absolute top-4 right-4 rounded-full p-2 text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--color)] transition-colors cursor-pointer"
          >
            <CloseIcon size={18} />
          </button>

          <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-violet-500/20 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <span className="text-4xl select-none">🏆</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
            {t('stats.levelUp' as TranslationKey)}
          </h2>

          <p className="mt-1 text-sm text-[var(--textSecondary)] leading-normal">
            {t('stats.levelUpCongrats' as TranslationKey, {
              level: String(level),
            })}
          </p>

          <div className="my-5 flex w-full flex-col gap-3">
            <div
              data-testid="level-up-coins-reward"
              className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-500/10 p-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl select-none">🪙</span>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold uppercase text-amber-300/80">
                    {t('stats.coinsReward' as TranslationKey)}
                  </span>
                  <span className="text-base font-extrabold text-amber-300">
                    +{coinAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-200 border border-amber-400/30">
                +{coinAmount}
              </span>
            </div>

            {reward && (
              <div
                data-testid="level-up-badge-reward"
                className="flex items-center justify-between rounded-xl border border-violet-400/30 bg-violet-500/10 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <CosmeticSprite
                      src={reward.assetUrl}
                      alt={reward.badgeId}
                      size={36}
                      data-testid="badge-image"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold uppercase text-violet-300/80">
                      {t('stats.milestoneBadgeUnlocked' as TranslationKey)}
                    </span>
                    <span className="text-sm font-bold text-[var(--color)]">
                      {t(`pages.shop.${reward.nameKey}` as TranslationKey)}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-400/30">
                  Lv. {level}
                </span>
              </div>
            )}
          </div>

          <div className="w-full">
            {isClaimed ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={closeModal}
                data-testid="level-up-claim-btn"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
              >
                {t('stats.rewardClaimed' as TranslationKey)}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={isClaiming}
                onClick={handleClaim}
                data-testid="level-up-claim-btn"
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                {isClaiming ? '...' : t('stats.claimReward' as TranslationKey)}
              </Button>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
