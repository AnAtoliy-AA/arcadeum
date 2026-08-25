'use client';

import { useCallback, useEffect } from 'react';
import type { AchievementPopupLabels } from '@/shared/i18n/messages/pages/achievements/en';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { checkNewlyUnlockedAchievements } from '../actions';
import { useAchievementsPopupStore } from '../store/achievementsPopupStore';
import { AchievementPopup } from './AchievementPopup';

/** Throttle window so tab-switching storms don't spam POST /check. */
const CHECK_THROTTLE_MS = 30_000;

// Module-level so every host mount shares one throttle window.
let lastCheckAt = 0;

function buildLabels(
  t: ReturnType<typeof useTranslation>['t'],
): AchievementPopupLabels {
  return {
    title: t('pages.achievements.popup.title'),
    unlocked: t('pages.achievements.popup.unlocked'),
    dismiss: t('pages.achievements.popup.dismiss'),
    xp: t('pages.achievements.popup.xp'),
  };
}

export function AchievementPopupHost() {
  const { t } = useTranslation();
  const enqueueMany = useAchievementsPopupStore((s) => s.enqueueMany);
  // Server actions POST to the current URL — never fire them for
  // anonymous visitors (auth pages, landing, e2e mocks count those POSTs).
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);

  const runCheck = useCallback(() => {
    if (!accessToken) return;
    const now = Date.now();
    if (now - lastCheckAt < CHECK_THROTTLE_MS) return;
    lastCheckAt = now;

    checkNewlyUnlockedAchievements()
      .then((items) => {
        if (items.length > 0) enqueueMany(items);
      })
      .catch(() => {});
  }, [enqueueMany, accessToken]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') runCheck();
    };

    runCheck();
    window.addEventListener('focus', runCheck);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', runCheck);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [runCheck]);

  return <AchievementPopup labels={buildLabels(t)} />;
}
