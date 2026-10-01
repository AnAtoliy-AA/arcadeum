'use client';

import { useEffect, useState, type CSSProperties } from 'react';
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
  'mx-auto mb-3 flex w-full max-w-[480px] items-center gap-3 rounded-xl border border-[rgba(251,191,36,0.25)] px-4 py-3';

const CHIP_STYLE: CSSProperties = {
  background:
    'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(124,58,237,0.08) 100%)',
};

const CTA_CLASSNAME =
  'w-full rounded-[10px] border-none px-5 py-3 text-center text-[14px] font-bold transition-opacity';

// SessionRoleSync starts its first cookie-restore attempt 2s after mount and
// retries a 401 once after 800ms, so give it slightly longer than that before
// falling back to the anonymous CTA for a stale persisted session.
const ANON_FALLBACK_MS = 4_000;

/**
 * Home-page CTA. The home route is `force-static`, so the status cannot be
 * read from cookies during SSR - the chip fetches `/daily-rewards/me` from
 * the browser instead (cookie + store token via `apiClient`). Anonymous
 * visitors get a sign-in CTA; authenticated users with an unclaimed reward
 * get the claim button.
 */
export function DailyRewardChip() {
  const { t } = useTranslation();
  const routes = useRoutes();

  const hydrated = useSessionStore((state) => state.hydrated);
  const accessToken = useSessionStore((state) => state.snapshot.accessToken);

  const [phase, setPhase] = useState<ChipPhase>('loading');
  const [status, setStatus] = useState<DailyRewardStatus | null>(null);

  // Refetch whenever the token changes: covers the post-reload cookie
  // restore (SessionRoleSync writes tokens back ~2s after mount) and a
  // login performed while the home page stays mounted.
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    (async () => {
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
          const snapshot = useSessionStore.getState().snapshot;
          const awaitingRestore =
            !snapshot.accessToken &&
            !!(snapshot.userId || snapshot.refreshToken);
          if (awaitingRestore) {
            // A prior session exists but its token has not been restored
            // from the httpOnly cookie yet. Stay in `loading` so a logged-in
            // user never sees the sign-in CTA; the token change re-runs this
            // effect once the restore lands. If it never does (dead session),
            // fall back to the anon CTA after ANON_FALLBACK_MS.
            fallbackTimer = setTimeout(() => {
              if (cancelled) return;
              setStatus(null);
              setPhase('anon');
            }, ANON_FALLBACK_MS);
            return;
          }
          setStatus(null);
          setPhase('anon');
          return;
        }
        // Network / 5xx - keep the home page clean rather than surface a
        // broken chip.
        setPhase('hidden');
      }
    })();

    return () => {
      cancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
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
        style={CHIP_STYLE}
      >
        <span aria-hidden className="inline-flex text-[24px] leading-none">
          {'🪙'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            href={routes.auth}
            data-testid="daily-reward-claim-btn"
            className={`${CTA_CLASSNAME} inline-block no-underline`}
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#0a0a0a',
            }}
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
      style={CHIP_STYLE}
    >
      <span aria-hidden className="inline-flex text-[24px] leading-none">
        {'🪙'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
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
