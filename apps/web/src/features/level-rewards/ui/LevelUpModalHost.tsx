'use client';

import React, { useEffect, useRef } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  getCoinsForLevel,
  getRewardForLevel,
} from '@/shared/lib/level-rewards';
import { useLevelUpModalStore } from '../store/levelUpModalStore';
import { getLevelRewardsStatus } from '../api/level-rewards.api';
import { LevelUpModal } from './LevelUpModal';

const LAST_SEEN_LEVEL_KEY = 'arcadeum_last_seen_level';

export function LevelUpModalHost() {
  const { snapshot } = useSessionTokens();
  const openModal = useLevelUpModalStore((s) => s.openModal);
  const isOpen = useLevelUpModalStore((s) => s.isOpen);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!snapshot.accessToken || isOpen) return;

    const currentLevel = snapshot.level || 1;
    const stored = window.localStorage.getItem(LAST_SEEN_LEVEL_KEY);
    const lastSeenLevel = stored ? parseInt(stored, 10) : null;

    if (lastSeenLevel !== null && currentLevel > lastSeenLevel) {
      window.localStorage.setItem(LAST_SEEN_LEVEL_KEY, String(currentLevel));
      const coinAmount = getCoinsForLevel(currentLevel);
      const reward = getRewardForLevel(currentLevel);
      openModal(currentLevel, coinAmount, reward?.badgeId ?? null);
      return;
    }

    if (lastSeenLevel === null) {
      window.localStorage.setItem(LAST_SEEN_LEVEL_KEY, String(currentLevel));
    }

    if (!checkedRef.current) {
      checkedRef.current = true;
      getLevelRewardsStatus(snapshot.accessToken)
        .then((res) => {
          if (res.unclaimedLevels.length > 0) {
            const latestUnclaimed =
              res.unclaimedLevels[res.unclaimedLevels.length - 1];
            const badge =
              res.pendingBadges.length > 0
                ? res.pendingBadges[res.pendingBadges.length - 1]
                : null;
            openModal(latestUnclaimed, res.pendingCoins, badge);
          }
        })
        .catch(() => {});
    }
  }, [snapshot.accessToken, snapshot.level, isOpen, openModal]);

  return <LevelUpModal />;
}
