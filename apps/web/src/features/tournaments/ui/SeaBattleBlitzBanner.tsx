'use client';

import React from 'react';
import Link from 'next/link';
import { Button, CountdownClock } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useLanguage } from '@/shared/i18n';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  useSeaBattleBlitzCup,
  useRegisterTournament,
  useUnregisterTournament,
} from '../hooks';
import type { SeaBattleBlitzCupResponse } from '../api';

export interface SeaBattleBlitzBannerLabels {
  ariaLabel: string;
  kicker: string;
  statusLive: string;
  statusOpen: string;
  statusClosed: string;
  statusUpcoming: string;
  statusRegistered: string;
  formatDetails: string;
  captainsReady: string;
  startsIn: string;
  battleStatus: string;
  playingNow: string;
  signInNotice: string;
  leaveCup: string;
  registerCup: string;
  tournamentFull: string;
  viewBracket: string;
  allTournaments: string;
}

export const DEFAULT_BLITZ_BANNER_LABELS: SeaBattleBlitzBannerLabels = {
  ariaLabel: 'Sea Battle Weekly Blitz Cup',
  kicker: 'Weekly Naval Championship',
  statusLive: 'Live Cup In Progress',
  statusOpen: 'Registration Open',
  statusClosed: 'Registration Closed',
  statusUpcoming: 'Upcoming Cup',
  statusRegistered: 'Registered',
  formatDetails: '{count} Captains • Single Elimination',
  captainsReady: 'Captains Ready',
  startsIn: 'Starts In',
  battleStatus: 'Battle Status',
  playingNow: 'PLAYING NOW',
  signInNotice: 'Sign in to enter the Blitz Cup',
  leaveCup: 'Leave Blitz Cup',
  registerCup: 'Register for Blitz Cup',
  tournamentFull: 'Tournament Full',
  viewBracket: 'View Bracket',
  allTournaments: 'All Tournaments',
};

export interface SeaBattleBlitzBannerProps {
  initialData?: SeaBattleBlitzCupResponse | null;
  labels?: Partial<SeaBattleBlitzBannerLabels>;
  className?: string;
}

export function SeaBattleBlitzBanner({
  initialData,
  labels,
  className,
}: SeaBattleBlitzBannerProps) {
  const { locale, messages } = useLanguage();
  const tournamentsMessages = messages?.pages?.tournaments as
    { blitzBanner?: Partial<SeaBattleBlitzBannerLabels> } | undefined;
  const t: SeaBattleBlitzBannerLabels = {
    ...DEFAULT_BLITZ_BANNER_LABELS,
    ...(tournamentsMessages?.blitzBanner ?? {}),
    ...(labels ?? {}),
  };
  const session = useSessionStore((s) => s.snapshot);
  const isAuthenticated =
    !!session.accessToken &&
    !!session.userId &&
    !session.userId.startsWith('anon_');

  const { data } = useSeaBattleBlitzCup();
  const blitzData = data ?? initialData;

  const registerMutation = useRegisterTournament();
  const unregisterMutation = useUnregisterTournament();

  const isPending = registerMutation.isPending || unregisterMutation.isPending;

  if (!blitzData?.tournament || blitzData.enabled === false) {
    return null;
  }

  const { tournament } = blitzData;
  const isFull = tournament.registeredCount >= tournament.maxPlayers;
  const canRegister =
    tournament.effectiveStatus === 'registration_open' && !isFull;
  const isLive = tournament.effectiveStatus === 'live';

  const handleRegister = async () => {
    if (!isAuthenticated || !canRegister || isPending) return;
    await registerMutation.mutateAsync({ id: tournament.id });
  };

  const handleUnregister = async () => {
    if (!isAuthenticated || !tournament.isRegistered || isPending) return;
    await unregisterMutation.mutateAsync({ id: tournament.id });
  };

  return (
    <section
      data-testid="sea-battle-blitz-banner"
      aria-label={t.ariaLabel}
      className={cx(
        'relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 backdrop-blur-md md:p-6 mb-8 shadow-xl shadow-cyan-950/20',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="trophy">
            🏆
          </span>
          <span className="text-xs uppercase tracking-widest font-black text-cyan-400">
            {t.kicker}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLive ? (
            <span
              data-testid="blitz-status-live"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 animate-pulse"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t.statusLive}
            </span>
          ) : tournament.effectiveStatus === 'registration_open' ? (
            <span
              data-testid="blitz-status-registration-open"
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300"
            >
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              {t.statusOpen}
            </span>
          ) : tournament.effectiveStatus === 'registration_closed' ? (
            <span
              data-testid="blitz-status-closed"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300"
            >
              {t.statusClosed}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/40 bg-slate-500/20 px-3 py-1 text-xs font-bold text-slate-300">
              {t.statusUpcoming}
            </span>
          )}

          {tournament.isRegistered && (
            <span
              data-testid="blitz-cup-registered-badge"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300"
            >
              {t.statusRegistered}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <h2
            data-testid="blitz-cup-title"
            className="text-xl md:text-2xl font-black tracking-tight text-[var(--colorForeground)]"
          >
            {tournament.name}
          </h2>
          {tournament.description ? (
            <p className="text-sm text-[var(--colorForegroundMuted)] mt-1 mb-4 line-clamp-2">
              {tournament.description}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--colorForegroundMuted)] mb-4">
            <span className="flex items-center gap-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 text-cyan-300">
              <span>💰</span>
              <span>
                {tournament.prizeDescription ?? '500 Coins + Admiral Trophy'}
              </span>
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 px-2.5 py-1 text-cyan-300">
              <span>⚓</span>
              <span>
                {t.formatDetails.replace(
                  '{count}',
                  String(tournament.maxPlayers),
                )}
              </span>
            </span>
          </div>

          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--colorForegroundMuted)]">
              <span>{t.captainsReady}</span>
              <span
                data-testid="blitz-cup-captains-count"
                className="font-bold text-cyan-300"
              >
                {tournament.registeredCount} / {tournament.maxPlayers}
              </span>
            </div>
            <progress
              data-testid="blitz-cup-progress"
              value={tournament.registeredCount}
              max={tournament.maxPlayers}
              className="h-2 w-full overflow-hidden rounded-full bg-slate-800 accent-cyan-400"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-4 text-center">
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-2">
            {isLive ? t.battleStatus : t.startsIn}
          </span>
          {isLive ? (
            <span className="text-lg font-black tracking-wider text-emerald-400">
              {t.playingNow}
            </span>
          ) : (
            <CountdownClock
              targetIso={tournament.scheduledAt}
              variant="compact"
              data-testid="blitz-cup-countdown"
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-cyan-500/20 flex-wrap">
        <div>
          {!isAuthenticated ? (
            <span
              data-testid="blitz-cup-signin-notice"
              className="text-xs text-[var(--colorForegroundMuted)]"
            >
              {t.signInNotice}
            </span>
          ) : tournament.isRegistered ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnregister}
              disabled={isPending}
              data-testid="blitz-cup-unregister-button"
            >
              {t.leaveCup}
            </Button>
          ) : canRegister ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleRegister}
              disabled={isPending}
              data-testid="blitz-cup-register-button"
            >
              {t.registerCup}
            </Button>
          ) : isFull ? (
            <span className="text-xs text-amber-400 font-medium">
              {t.tournamentFull}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/tournaments/${tournament.id}`}>
            <Button
              variant="outline"
              size="sm"
              data-testid="blitz-cup-view-bracket"
            >
              {t.viewBracket}
            </Button>
          </Link>
          <Link href={`/${locale}/tournaments`}>
            <Button
              variant="ghost"
              size="sm"
              data-testid="blitz-cup-all-tournaments"
            >
              {t.allTournaments}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
