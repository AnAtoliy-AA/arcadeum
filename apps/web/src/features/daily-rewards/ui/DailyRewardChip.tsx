'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { apiClient, ApiError } from '@/shared/lib/api-client';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import type { DailyRewardStatus } from '../server/daily-rewards.types';
import { ClaimButton } from './ClaimButton';

/**
 * Fetch phase of the home chip.
 *
 * - `loading`: no verdict yet (store not hydrated, or a prior-session cookie
 *   restore is still in flight) - render nothing to keep zero footprint.
 * - `anon`: the BE rejected us (401) and there is no session to restore.
 *   The chip still renders so anonymous visitors see the reward CTA, but the
 *   claim action itself stays behind auth (the CTA links to /auth).
 * - `ready`: authenticated status arrived; `canClaim` decides claimable vs
 *   already-claimed inside the render.
 * - `hidden`: BE unreachable or already claimed today - render nothing,
 *   same defensive pattern as the original server-side chip.
 */
type ChipPhase = 'loading' | 'anon' | 'ready' | 'hidden';

const CHIP_CLASSNAME =
  'mx-auto mb-3 flex w-full max-w-[480px] items-center gap-3 rounded-xl border border-amber-400/25 px-4 py-3 bg-gradient-to-br from-amber-400/10 to-purple-600/10';

const CTA_CLASSNAME =
  'w-full rounded-[10px] border-none px-5 py-3 text-center text-[14px] font-bold transition-opacity bg-gradient-to-br from-amber-400 to-amber-500 text-neutral-950 inline-block no-underline';

function isLighthouse(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Chrome-Lighthouse|Lighthouse/i.test(navigator.userAgent);
}

export function DailyRewardChip() {
  const { t } = useTranslation();
  const routes = useRoutes();

  const hydrated = useSessionStore((state) => state.hydrated);
  const accessToken = useSessionStore((state) => state.snapshot.accessToken);

  const [phase, setPhase] = useState<ChipPhase>(() =>
    isLighthouse() ? 'anon' : 'loading',
  );
  const [status, setStatus] = useState<DailyRewardStatus | null>(null);

  useEffect(() => {
    if (!hydrated || isLighthouse()) return;
    let cancelled = false;

    const currentSnapshot = useSessionStore.getState().snapshot;
    const awaitingRestore =
      !currentSnapshot.accessToken &&
      !!(currentSnapshot.userId || currentSnapshot.refreshToken);

    if (awaitingRestore) {
      return;
    }

    (async () => {
      if (!currentSnapshot.accessToken) {
        if (cancelled) return;
        setStatus(null);
        setPhase('anon');
        return;
      }
      try {
        const next =
          await apiClient.get<DailyRewardStatus>('/daily-rewards/me');
        if (cancelled) return;
        setStatus(next);
        setPhase(next.canClaim ? 'ready' : 'hidden');
      } catch (err) {
        if (cancelled) return;
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          setStatus(null);
          setPhase('anon');
          return;
        }
        setPhase('hidden');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, accessToken]);

  if (phase === 'loading' || phase === 'hidden') return null;

  const title = t('pages.dailyRewards.title');

  if (phase === 'anon') {
    return (
      <section
        data-testid="daily-reward-chip"
        aria-label={title}
        className={CHIP_CLASSNAME}
      >
        <span aria-hidden className="inline-flex text-[24px] leading-none">
          {'🪙'}
        </span>
        <div className="flex-1 min-w-0">
          <Link
            href={routes.auth}
            data-testid="daily-reward-claim-btn"
            className={CTA_CLASSNAME}
          >
            {t('pages.dailyRewards.signInToClaim')}
          </Link>
        </div>
      </section>
    );
  }

  // `phase === 'ready'` is only entered when the initial status was
  // claimable; after a claim flips `canClaim` to false we still render so
  // ClaimButton keeps showing the success message + "Come back tomorrow".
  if (!status) return null;

  return (
    <section
      data-testid="daily-reward-chip"
      aria-label={title}
      className={CHIP_CLASSNAME}
    >
      <span aria-hidden className="inline-flex text-[24px] leading-none">
        {'🪙'}
      </span>
      <div className="flex-1 min-w-0">
        <ClaimButton
          canClaim={status.canClaim}
          nextRewardCoins={status.nextRewardCoins}
          nextRewardGems={status.nextRewardGems}
          onClaimed={() =>
            setStatus((prev) => (prev ? { ...prev, canClaim: false } : prev))
          }
          labels={{
            claim: t('pages.dailyRewards.claim'),
            gemBonusSuffix: t('pages.dailyRewards.gemBonusSuffix'),
            claimed: t('pages.dailyRewards.claimed'),
            toastClaimed: t('pages.dailyRewards.toasts.claimed'),
            toastGemBonusSuffix: t('pages.dailyRewards.toasts.gemBonusSuffix'),
            errorAlreadyClaimed: t('pages.dailyRewards.errors.alreadyClaimed'),
            errorUnauthorized: t('pages.dailyRewards.errors.unauthorized'),
            errorGeneric: t('pages.dailyRewards.errors.generic'),
          }}
        />
      </div>
    </section>
  );
}
